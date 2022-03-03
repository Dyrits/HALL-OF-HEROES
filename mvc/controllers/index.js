const mongoose = require("mongoose");
const Hero = mongoose.model("Hero");
const Squad = mongoose.model("Squad");
const { heroes, squads } = require("../../data");
const {resolveInclude} = require("ejs");

function getOverall(hero) {
    let { strength, perception, endurance, charisma, intelligence, agility, luck } = hero.stats;
    return [strength, perception, endurance, charisma, intelligence, agility, luck]
        .reduce((accumulator, value) => accumulator + value);
}

getIndex = function(req, res, next) {
    res.render('index', { title: 'Mongoose' });
}

getHeroesIndex = function(req, res, next) {
    Hero.find({}, "", { lean: true }, (error, heroes) => {
        if (error) { return res.send({ error }); }
        for (let hero of heroes) { hero.overall || (hero.overall = getOverall(hero)); }
        res.render("heroes", {title: "Hall of Heroes", heroes });
    });
}

getHeroesForm = function(req, res, next) {
    Squad.find((error, squads) => {
        if (error) { return res.send({error}); }
        res.render("create-a-hero", { title: "Create a Hero", squads });
    })
}

getUpdateForm = function({ params }, res, next) {
    Hero.findById(params.id, (error, hero) => {
        if (error) { return res.send({ error }); }
        Squad.find((error, squads) => {
            if (error) { return res.send({ error }); }
            res.render("update-hero", { title: "Update Hero", hero, squads })
        })
    })
}

createNewHero = function({ body }, res) {
    let hero = {
        name: body.name,
        description: body.description,
        stats: {
            strength: body.strength,
            perception: body.perception,
            endurance: body.endurance,
            charisma: body.charisma,
            intelligence: body.intelligence,
            agility: body.agility,
            luck: body.luck
        }
    }
    body.origin && ( hero.origin = body.origin );
    body.squad && (hero.squad = body.squad);
    hero.overall = getOverall(hero);
    Hero.create(hero, (error, newHero) => {
        if (error) { return res.send({ error }); }
        res.redirect("/heroes");
    });
}

updateHero = function({params, body}, res) {
    Hero.findById(params.id, (error, hero) => {
        if (error) { return res.send({ error }); }
        hero.name = body.name;
        hero.description = body.description;
        body.origin && ( hero.origin = body.origin );
        hero.stats = {
            strength: body.strength,
            perception: body.perception,
            endurance: body.endurance,
            charisma: body.charisma,
            intelligence: body.intelligence,
            agility: body.agility,
            luck: body.luck
        }
        hero.overall = getOverall(hero);
        hero.squad = body.squad ? body.squad : undefined;
        hero.save((error, updatedHero) => {
            if (error) { return res.send({ error }); }
            res.redirect("/heroes");
        })
    })
}

deleteHero = function({ params }, res) {
    Hero.findByIdAndRemove(params.id, (error, hero) => {
        if (error) { return res.send({ error }); }
        res.redirect("/heroes");
    })
}

reset = function (req, res) {
    Promise.all([
        new Promise((resolve, reject) => {
            Hero.deleteMany({}, (error, info) => {
                if (error) {
                    reject("An error occurred while deleting the heroes.")
                    return res.send({ error });
                }
                resolve("The heroes have been successfully deleted!");
            });
        }),
        new Promise((resolve, reject) => {
            Squad.deleteMany({}, (error, info) => {
                if (error) {
                    reject("An error occurred while deleting the squads.")
                    return res.send({ error });
                }
                resolve("The squads have been successfully deleted!");
            });
        })
    ]).then(() => {
        Hero.insertMany(heroes, (error, info) => {
            if (error) { return res.send({ error }); }
        });
        Squad.insertMany(squads, (error, info) => {
            if (error) { return res.send({ error }); }
        });
    }).then(() => { res.redirect("/heroes"); })
}

getSquadsIndex = function(req, res) {
    Squad.find({}, null, { lean: true },(error, squads) => {
        if (error) { return res.send({ error }); }
        Hero.find({ squad : { $exists: true } }, "", { lean: true }, (error, heroes) => {
            if (error) { return res.send({ error }); }
            for (let index = 0; index < squads.length; index++ ) {
                squads[index].heroes = heroes.filter(hero => hero.squad === squads[index].name);
                squads[index].overall = squads[index].heroes.reduce((accumulator, current) => accumulator + current.overall, 0);
            }
            res.render("squads", { title: "Squads", squads });
        })
    })
}

getSquadForm = function(req, res) {
    res.render("create-squad", { title: "Create a Squad"});
}

createSquad = function({ body }, res) {
    let { name, headquarter } = body;
    headquarter || (headquarter = "Unknown");
    let squad = { name, headquarter };
    Squad.create(squad, (error) => {
        if (error) { return res.send({ error }); }
        res.redirect("/squads");
    })
}

deleteSquad = function({ params }, res) {
    Squad.findByIdAndRemove(params.id, (error, squad) => {
        if (error) { return res.send({ error }); }
        Hero.find({ squad: { $exists: true } }, "squad", {}, (error, heroes) => {
            if (error) { return res.send({ error }); }
            let promises = [];
            for (let hero of heroes.filter(hero => hero.squad === squad.name)) {
                hero.squad = undefined
                let promise = new Promise((resolve, reject) => {
                    hero.save((error) => {
                        if(error) {
                            reject("The hero couldn't be saved.");
                            return res.send({ error })
                        }
                        resolve("Hero saved successfully!");
                    });
                });
                promises.push(promise);
            }
            Promise.all(promises).then(() => {
                res.redirect("/squads");
            });
        })
    })
}

module.exports = {
    getIndex, getHeroesIndex, getHeroesForm, getUpdateForm, createNewHero, updateHero, deleteHero, reset, getSquadsIndex, getSquadForm, createSquad, deleteSquad
};