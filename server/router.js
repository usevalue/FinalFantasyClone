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

    let party = [sampleHeroes.cloud, sampleHeroes.aeris]
    res.send(party);
});

router.get('/getmonsters', (req, res)=>{
    //  This would also have to be a more fleshed-out in a fuller game.

    let party= [sampleMonsters.rabbit, sampleMonsters.fungus, sampleMonsters.rabbit]
    res.send(party);
});



module.exports=router;
