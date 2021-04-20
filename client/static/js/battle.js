//
//
//      FINAL FANTASY VII BATTLE EMULATOR
//
//            by James Pollard
//                GPL 3.0
//
//
//      This program provides a minimalistic
//      simulation of a battle in Final Fantasy VII.
//      For minimum implementation, see
//      https://github.com/usevalue/????
//


$(async ()=>{
        
    // GAME CONSTANTS
    const framedelay = 400; // How many milliseconds between frames?
    const happyIcon = "&#9786;";
    const deadIcon = "&#9760;";
    const timeout = 100000;  // Maximum frames before battle ends in a stalemate
    
    //
    //          FUNCTIONS
    //
    //     1.  Setup functions
    //     2.  Battle system
    //     3.  Combat actions
    //     4.  Drawing functions
    //


    //
    //      1.  SETUP
    //

    // The order of battle will be stored in two arrays

    var party = []
    var monsters = []

    // Loads hero and monster data into arrays.
    async function load() {
        try {
            await $.ajax({
                url: 'getheroes',
                type: 'GET',
                success: (data) => {
                    party=data;
                    partySetup(party);
                }
            });
            await $.ajax({
                url: 'getmonsters',
                type: 'GET',
                success: (data) =>{
                    monsters=data;
                    monsterSetup()
                }
            });
        }
        catch(e) {
            console.log(e);
            window.alert("I'm sorry, the server is down!");
        }
    }

    //  It is assumed that the server sends a minimal set of stats, and some set-up will be required.
    //  If you are programming a campaign, you may wish to track more of these variables server-side.

    function partySetup() {
        party.forEach(element=>{
            //  Every party member must be tagged with their faction and given their initial combat stance
            element.faction = 'party'; // Tagging for the AI
            element.stance = 'waiting'; // Regarding turn-taking

            // Start everyone at full everything
            element.hp = element.max_hp;
            element.mp = element.max_mp;

            // Limit breaks!
            element.limit=0;

            //  Start everyone off with some amount of their action meter filled
            element.initiative = Math.floor(Math.random()*50)+10;
        })
    }

    //  Setup for monsters is similar
    function monsterSetup() {
        monsters.forEach(element => {
            element.faction = 'monsters';
            element.stance = 'waiting';
            element.hp = element.max_hp;
            element.mp = element.max_mp;
            //  The monsters are a little slower initially.
            element.initiative = Math.floor(Math.random()*20)+10;
        })
           
    }


    //
    //      2.  Order of battle
    //


	// Simulation variables
	var battleStage = "opening";    // The battle does an opening sequence, then enters fighting, before terminating with victory or defeat
	var clockRunning = true;        //  The simulation runs constantly, but the action guages only fill when clock is running
	var currentActors=[];           //  When someone stops the clock, they are added to the list of active combatants
                                    //  whose actions must be resolved before continuing.
	

	// A frame runs at interval defined in framedelay


    var frames = 0;
    var countdown = 1; // Frames before battle begins

	function frame() {
		switch(battleStage) {
            case 'opening':
                if(countdown==0) {
                    $('#banner').html('Battle begins...');
                    battleStage="fighting";
                }
                else countdown--;
                break;
            case 'fighting':
                if(clockRunning) runClock();
                else runAction();
                if(frames>timeout) battleStage='stalemate';
                break;
            case 'stalemate':
                window.alert('Battle ends in stalemate');
                battleState = 'end';
                break;
            case 'victory':
                window.alert('You win!');
                battleStage = 'end';
                break;
            case 'defeat':
                window.alert('You lose!');
                battleStage = 'end';
                break;
            case 'end':
                clearInterval(battle);
                console.log('battle over');
                break;
        }
        frames++;
		// Update stats display every frame, the rest as needed.
		heroStats(party);
	}


	//
	//		THE CLOCK
	//
	//  This function increases everyone's initiative by their speed value.
	//  If anyone has hit 100 or more inititative, their stance is set to 'ready',
	//  and a reference to their type and index is added to the "currentActors" array.
    //

    var clockTicks = 0;

	function runClock() {
		//  We'll be checking each tick how many are conscious.
		let partyActive = 0;
		let monstersActive = 0;

		for(let i=0; i<party.length; i++) {
			if(party[i].hp>0) {
				partyActive++;
				party[i].initiative = party[i].initiative + party[i].speed;
				if(party[i].initiative>=100) {
					clockRunning=false;
					party[i].stance='ready';
                    let reference = ['party', i]
					currentActors.push(reference);
				}
			}
		}

		for(let i=0; i<monsters.length; i++) {
			if(monsters[i].hp>0) {
                monstersActive++;
				monsters[i].initiative = monsters[i].initiative + monsters[i].speed;
				if(monsters[i].initiative>=100) {
					clockRunning=false;
					monsters[i].stance='ready';
					let reference = ['monsters', i]
					currentActors.push(reference);
				}
			}
		}

        if(partyActive==0) battleStage = 'defeat';
        else if (monstersActive==0) battleStage = 'victory';
        clockTicks++;
	}

    //  If the clock is stopped, it means there are actions to be processed.
    //  Actions are processed starting at the end of the currentActors list, processing each one
    //  over the course of several frames before proceeding to the next.  Each action,
    //  creatures go through several stances which determine how they look on the battlefield,
    //  what actions they can take, etc.  These can be used for simple animations or more complex AI

    function runAction() {
        if(currentActors.length>0) {
            let currentReference = currentActors[currentActors.length-1];
            var current;
            if(currentReference[0]=='party') current = party[currentReference[1]];
            else current = monsters[currentReference[1]];
            switch(current.stance) {
                case 'ready':
                    $('#banner').html(current.name + ' is ready!');
                    if(current.faction=="party") displayControls(current);
                    current.stance = 'active';
                    drawField();
                    break;
                case 'active':
                    if(current.faction=="monsters") {
                        doAttack(current, randomHero());
                    }
                    //  In single-player games, just wait.  In multiplayer, a timeout mechanism would be useful.
                    break;
                case 'finished':
                    current.initiative = 0;
                    current.stance = 'waiting';
                    currentActors.pop();
                    drawField();
                    break;
                case 'fainted':
                    current.initiative = 0;
                    currentActors.pop();
                    drawField();
                    break;
            }
        }
        // If no one else needs to do anything, restart the clock.
        else clockRunning = true;

        // Update battlefield display.
    }
    
    //
    //          3.  Combat actions
    //

    function doAttack(attacker, defender) {
        damage(defender, attacker.attack)
        if(defender.hp<=0) {
            $('#banner').html(attacker.name + ' slays ' + defender.name +'!');
            defender.stance = 'fainted';
        }
        else $('#banner').html(attacker.name + ' attacks ' + defender.name + ' for ' + attacker.attack + ' damage.');
        attacker.stance = 'finished';
    }

    function damage(poorthing, damage) {
        poorthing.hp -= damage;
        if(poorthing.faction=="party") poorthing.limit+=Math.floor(damage/10);
    }

    function heal(luckything, healing) {
        luckything.hp+=healing;
        if(luckything.hp>luckything.max_hp) luckything.hp = luckything.max_hp;
    }

	// Returns a random hero for AI attacks.
	function randomHero() {
		let choice=Math.floor(Math.random()*party.length);
		return party[choice];
	}



    //
    //  DISPLAY FUNCTIONS
    //
    //  Draws the battlefield
    //

    // Display hero icons
    function displayHeroes() {
        $('#heroIcons').html('');
        for(let i=0; i<party.length; i++) {
            let hero=party[i]

            let icon;
            if(hero.hp>0) icon=happyIcon; else icon=deadIcon;
            let id = "hero_"+i;
            let avatar = "<span class='avatar' id='"+id+"'>"+icon+"</span>";
            $('#heroIcons').append(avatar);
            $('#'+id).css('color', hero.color);
            if(hero.stance=="active")  $('#'+id).css('text-decoration', 'underline');
        }
    }

    function displayEnemies() {
        $('#monsters').html('');
        for(let i=0; i<monsters.length; i++) {
            let enemy = monsters[i]
            let icon;
            if(enemy.hp>0) icon=enemy.icon; else icon=deadIcon;
            let id = 'monster_'+i;
            let avatar = "<span class='avatar' id='"+id+"'>"+icon+"</span>";
            $('#monsters').append(avatar);
            $('#'+id).css('color', enemy.color);
            if(enemy.stance=="active")  $('#'+id).css('text-decoration', 'underline');
        }
    }

    function drawField() {
        displayHeroes();
        displayEnemies();
    }

    // Runs every frame: hero stats

    function heroStats() {
        $('#heroStats').html('');
        party.forEach(element => {
            // Displaying an entry in the info table
            let entry = "<tr><th>"+element.name+"</th><td>"+
                element.hp+"/"+element.max_hp+" HP</td><td>"+
                element.mp+"/"+element.max_mp+" MP</td><td>"+
                element.stance+"</td><td>"+
                Math.floor(element.limit)+"% LIMIT</td><td>"+
                Math.floor(element.initiative)+"% ACTION</td></tr>";
            $('#heroStats').append(entry);
        });
    }

    //  Renders when required: control interface

    function displayControls(hero) {
        $('#banner').html(hero.name+' is up!');
        $('#controls').html('');  // Clear the control panel in case redrawing
        
        //  Attacks
        $('#controls').append("<button id='attackbutton'>Attack</button>");
        $('#attackbutton').on('click', ()=>{
            for(let i=0; i<monsters.length; i++) {
                $('#monster_'+i).on('click', (click)=>{
                    doAttack(hero, monsters[i]);
                    hero.stance = 'finished';
                    //  Once the attack is made, refresh the enemy icons to clear the events.
                    displayEnemies();
                    $('#controls').html('');
                });
                $('#attackbutton').on('click', displayControls(hero));
                $('#attackbutton').html('cancel attack')
            }
        })

        // Limit break
        if(hero.limit>=100) {
        $('#controls').append("<button id='limitbreak'>LIMIT!!!</button>");
        $('#limitbreak').on('click', ()=>{
            for(let n=0; n<party.length; n++) {
                heal(party[n], 30);
            }
            let currentIndex = currentActors[currentActors.length-1][1];
            party[currentIndex].stance="finished";
            party[currentIndex].limit=0;
            $('#controls').html('');
        });
    }

        // Healing
    }

	//  BATTLE SET-UP

    await load();
	$('#banner').html('You have been attacked by '+monsters.length+' beasties!');
	drawField();
	heroStats();
	var battle = setInterval(frame, framedelay)

})
