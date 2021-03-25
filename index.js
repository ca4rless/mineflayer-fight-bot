const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const inventoryViewer = require('mineflayer-web-inventory')
const { GoalNear, GoalFollow } = require('mineflayer-pathfinder').goals
const { pathfinder, Movements } = require('mineflayer-pathfinder')


console.log('starting')

let equipping = false

let target = undefined
let defaultMove

const bot = mineflayer.createBot({
    host: "localhost",
    port: 12345,
    username: "the_boi",
    version: "1.8.9"
});

bot.loadPlugin(pathfinder)
function dodgeAttacks() {
    // console.log(bot.players)
}



function attackIfClose() {
    let entity = nearestEntity()
    if (entity) {
        const dist = distance(bot.player.entity.position, entity.position)
        // console.log(bot.player)
        // console.log(`distance=${dist}`)
        if (entity.type === 'player' && dist < 3.0) {
            // console.log(`attacking: distance = ${dist}`)
            bot.attack(entity, true);
        }
    } else {
        // console.log('no nearby entities');
    }

    setTimeout(attackIfClose, 83)
}

bot.once('spawn', () => {
    dodgeAttacks()
    console.log('bot spawn')
    console.log(bot.players.entity)
    let options = {
        port: 3000,
        startOnLoad: true
    };
    // mineflayerViewer(bot, { port: 3002, firstPerson: false })
    inventoryViewer(bot, options)
    console.log('viewers are active')
    setTimeout(goldenAppleEat, 250)
    // console.log(entity)
    setTimeout(attackIfClose, 83)
});

function nearestEntity(type) {
    var id, entity, dist;
    var best = null;
    var bestDistance = null;
    for (id in bot.entities) {
        entity = bot.entities[id];
        if (type && entity.type !== type) continue;
        if (entity === bot.entity) continue;
        dist = bot.entity.position.distanceTo(entity.position);
        if (!best || dist < bestDistance) {
            best = entity;
            bestDistance = dist;
        }
    }
    return best;
}

function walkTowardsTarget() {
    bot.chat('walking...')
    let p = target.position
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 0.001))
}

// bot.on("physicsTick", () => {
//     if (target)
//         walkTowardsTarget();
// });

bot.on('chat', function (username, message) {
    if (username === bot.username) return
    const _target = bot.players[username] ? bot.players[username].entity : null
    if (message === '@fight') {
        if (!_target) {
            bot.chat('I don\'t see you !')
            return
        } else {
            bot.chat('target set')
            target = _target;
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalFollow(_target, 0.00001))
        }
    } else if (message === '@stop') {
        bot.chat('target reset')
        target = undefined;
        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(undefined);
    }
})


bot.once('spawn', () => {
    // console.log(bot.inventory.items())
    const mcData = require('minecraft-data')(bot.version)
    defaultMove = new Movements(bot, mcData)


});

function goldenAppleCheck(items) {
    // bot.chat(`number of items: ${items.length}`)
    for (let item of items) {
        // console.log(item)
        if (item.type === 322) return true
    }
    return false
}

function slotEquipped(error) {
    // console.log('activating slot')
    // const goldenApple = 322
    equipping = false

    if (goldenAppleCheck(bot.inventory.items())) {
        eatGoldenApple()
    } else {
        // bot.chat('no golden apples')
    }


}
function eatGoldenApple() {
    bot.activateItem()
    // bot.chat("healing")
    setTimeout(function () {
        const sword = 276;
        // console.log('equipping sword')
        bot.equip(sword, "hand", (er) => {
            // console.log(`equip sword: error=${er}`) 
        })
    }, 2500)
}

function goldenAppleEat() {
    let health = bot.health;
    if (health < 8) {
        const slots = bot.inventory.slots;
        // console.log(slots)
        for (const slot of slots) {
            if (slot) {
                if (slot.name === "golden_apple" && equipping === false) {
                    // console.log(`golden apple located: ${equipping}`)
                    // console.log(slots)
                    equipping = 1
                    // bot.chat("golden appl found")
                    // console.log('equipping slot')
                    bot.equip(slot, "hand", (error) => { slotEquipped(error) });


                    // bot.equip(276, "hand" )
                }
            }
        }

    }
    setTimeout(goldenAppleEat, 250)
}

function distance(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}