const sampleHeroes = {
    cloud: {
        id: 1,
        name: 'Cloud',
        attack: 30,
        max_hp: 300,
        max_mp: 200,
        speed: 20,
        color: '#FF0000'
    },
    aeris: {
        id: 2,
        name: 'Aeris',
        attack: 10,
        max_hp: 200,
        max_mp: 300,
        speed: 5,
        color: '#0000FF'
    },
}

const sampleMonsters = {
    rabbit: {
        id: 1,
        name: 'Ferocious rabbit',
        attack: 1,
        max_hp: 50,
        max_mp: 0,
        speed: 18,
        icon: '&#9752;',
        color: '#DDFFDD'
    },
    fungus: {
        id: 2,
        name: 'Poisonous mushroom',
        attack: 10,
        max_hp: 40,
        max_mp: 10,
        speed: 8,
        icon: '&#9763;',
        color: '#AA22CC'
    }
}

module.exports = {sampleHeroes, sampleMonsters}