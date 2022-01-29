const mongoose = require("mongoose");
const Hero = mongoose.model("Hero");
const { heroes } = require("../../data");

getIndex = function(req, res, next) {
    res.render('index', { title: 'Mongoose' });
}

getHeroesIndex = function(req, res, next) {
    Hero.find((error, heroes) => {
        if (error) { return res.send({ error }); }
        res.render("heroes", { title: "Hall of Heroes", heroes: heroes });
    });
}

getHeroesForm = function(req, res, next) {
    res.render("create-a-hero", { title: "Create a Hero" });
}

getUpdateForm = function({ params }, res, next) {
    Hero.findById(params.id, (error, hero) => {
        if (error) { return res.send({ error }); }
        res.render("update-hero", { title: "Update Hero", hero: hero})
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
    Hero.deleteMany({}, (error, info) => {
        if (error) { return res.send({ error }); }
        Hero.insertMany(heroes, (error, info) => {
            if (error) { return res.send({ error }); }
            res.redirect("/heroes");
        })
    });
}


module.exports = {
    getIndex, getHeroesIndex, getHeroesForm, getUpdateForm, createNewHero, updateHero, deleteHero, reset
};