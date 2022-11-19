(async function run() {
    fetch('https://react-job-board.herokuapp.com/api/send-subscription-email', {
        method: 'POST',
        body: {}
    }).then(res => {
        res.json().then(data => console.log('data: ', data))
    }).catch(err => console.log("ERROR"))
})()