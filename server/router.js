const express = require('express');
const { sampleHeroes, sampleMonsters } = require('./gameconstants');

const router = express.Router();


//
// Called by game client upon loading
//


router.get('/getheroes', (req, res)=>{
    //  The game client expects an array, but our sampleHeroes are a JSON object.
    //  It will be necessary to construct the array server-side.  Since
    //  this is an example, the construction will be arbitrary.  In a full
    //  game, you would be building this based on what the player(s) had
    //  unlocked at that stage, based on their account information etc.

    // RED TODO:
    // 1.  Get player hero lineup


    // BLUE TODO:
    // 1.  Get hero from each player, compile into lineup

    let party = [sampleHeroes.cloud, sampleHeroes.aeris]
    res.send(party);
});

router.get('/getmonsters', (req, res)=>{

    // RED STUDIO TODO:
    // 1.  Look up what level the player is on
    // 2.  Load up the monsters for that level

    // BLUE STUDIO TODO:
    // 1.  Look up area you are exploring
    
    let party = [sampleMonsters.fungus, sampleMonsters.fungus]
    res.send(party);
});



module.exports=router;
