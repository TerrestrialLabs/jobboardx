
fetch('http://localhost:3000/api/send-subscription-email', {
    method: 'POST',
    body: {}
}).then(res => {
    res.json().then(data => console.log('data: ', data))
}).catch(err => console.log("ERROR"))