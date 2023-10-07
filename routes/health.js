const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/health', async(req, res) => {

    const results = [];

    // Loop through servers and health check each 
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];

        try {
            const response = await axios.get(`http://${server.host}:${server.port}/app/healthcheck`);
            // Check status
            if (response.status === 200) {
                results.push({
                    id: server.id,
                    status: 'passing'
                });
            } else {
                results.push({
                    id: server.id,
                    status: 'failing'
                });
            }

        } catch (error) {
            results.push({
                id: server.id,
                status: 'failing'
            });
        }
    }

    // Return summarized results
    res.json(results);
});

module.exports = router;