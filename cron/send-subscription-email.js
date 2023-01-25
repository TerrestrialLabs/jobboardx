const fetch = require('node-fetch')

async function run() {
    fetch(`https://www.jobboardx.io/api/jobboards`).then(boardsRes => {
        boardsRes.json().then(data => {
            console.log('data: ', data)
            data.forEach(jobboard => {
                fetch(`https://www.jobboardx.io/api/send-subscription-email`, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobboard })
                }).then(emailRes => {
                    emailRes.json().then(emailData => console.log(emailData))
                }).catch(err => console.log("ERROR"))
            })
        })
    }).catch(err => console.log("ERROR"))
}

run()