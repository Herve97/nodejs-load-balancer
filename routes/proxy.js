const express = require('express');
const proxy = require('http-proxy-middleware');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Strategy interface 
function Strategy() {
    this.select = null;
}

// Random strategy
function RandomStrategy() {

    // Set select method
    this.select = function() {
        // Return random server
    }

}

// Round robin strategy
function RoundRobinStrategy() {

    // Set select method
    this.select = function() {
        // Return next server in round robin fashion
    }

}

// Map strategies to readable names
const Strategies = {
    'random': RandomStrategy,
    'roundrobin': RoundRobinStrategy
};

// Get selected strategy
const Strategy = Strategies[config.strategy];

const selector = new Strategy();

// Use strategy to select server
const server = selector.select();

const servers = [{
        host: 'localhost',
        port: 3000,
        weight: 1,
    },
    // Add more servers here
];

// Total weights
let totals = [];

// Generate list of cumulative weights 
function initWeights() {

    totals = [];
    let runningTotal = 0;

    for (let i = 0; i < servers.length; i++) {
        runningTotal += servers[i].weight;
        totals.push(runningTotal);
    }

}

// Proxy middleware configuration
const proxyOptions = {
    target: '',
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
        // Add custom header to request
        proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
    },
    logLevel: 'debug'
};

// Proxy options
const options = {
    onProxyReq: (proxyReq, req) => {
        // Log details like request timestamps, headers etc

    },
    onProxyRes: (proxyRes) => {
        // Log response status, time taken, etc.

    }
}

// Next server index
let currIndex = 0;

// Get next server
function getServer() {

    const random = Math.floor(Math.random() * totals[totals.length - 1]) + 1;

    // Find server at index for this weight
    for (let i = 0; i < totals.length; i++) {
        if (random <= totals[i]) {
            return servers[i];
        }
    }

    // Round robin
    currIndex = (currIndex + 1) % servers.length;

    return servers[currIndex];
}

let healthyServers = [];

// Generate cookie name
const COOKIE_NAME = 'lb-affinity';

app.use(cookieParser());

const draining = [];
const drained = [];

// Drain server - leave in proxying but don't add new clients
function drain(serverId) {
    draining.push(serverId);
}

// Mark server as fully drained 
function drained(serverId) {
    drained.push(serverId);
}


// Proxy requests
router.all('*', (req, res) => {

    // No affinity for first request
    if (!req.cookies[COOKIE_NAME]) {
        // Set cookie 
        res.cookie(COOKIE_NAME, selectedServer.id, {
            httpOnly: true
        });

        const server = servers[0]; // Select server

        // Check if draining
        if (draining.includes(server.id)) {
            return sendToBackup(req, res); // Bypass if draining
        }

    } else {
        // Re-route request to previously selected server
        const affinityId = req.cookies[COOKIE_NAME];

        selectedServer = servers.find(s => s.id === affinityId);
    }

    if (healthyServers.length === 0) {
        return res.status(500).send('No healthy servers!');
    }

    // Get next target server
    const target = getServer();
    proxyOptions.target = `http://${target.host}:${target.port}`;

    // Forward request
    createProxyMiddleware(proxyOptions)(req, res);
});

// Fully remove from pool
function removeServer(serverId) {

    const index = servers.findIndex(s => s.id === serverId);

    if (index !== -1) {
        servers.splice(index, 1);
    }

    drained.splice(drained.indexOf(serverId), 1);

}

// Add back to pool 
function addServer(server) {
    servers.push(server);
}

// Update list of healthy servers
function updateHealthyServers() {
    // Check health status
    // ...

    healthyServers = healthyServers // Filter only healthy servers 
}

// Call initially 
updateHealthyServers();

// Update health periodically
setInterval(updateHealthyServers, 10000);

module.exports = router;