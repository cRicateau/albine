var server = '88.190.241.96:3000';

window.addEventListener('load', function() {

    var header = document.getElementById('header');
    var content = document.getElementById('content');

    var openSocket = function(address) {
        var socket = new WebSocket('ws://' + address);

        socket.addEventListener('close', function(close) {
            header.className = 'disconnected';
            window.setTimeout(function() {
                openSocket(address);
            }, 1000);
        });

        socket.addEventListener('error', function(error) {
            console.error(error);
        });

        socket.addEventListener('message', function(message) {
            header.className = '';
            var state = JSON.parse(message.data);

            console.log(state); // @DEBUG

            if (state.mode == 'tweet') {
                content.innerHTML = [
                    '<div id="tweets">',
                    state.tweets.map(function(tweet) {
                        return '<div>' + tweet + '</div>';
                    }).join(''),
                    '</div>',
                    '<div id="coeurometre">',
                    '    <div id="gauge">',
                    '        <div id="bar-albert" class="bar">', state.votes.albert, '</div>',
                    '        <div id="bar-pauline" class="bar">', state.votes.pauline,'</div>',
                    '        <img class="albert" src="albert.png" alt="albert">',
                    '        <img class="pauline" src="pauline.png" alt="pauline">',
                    '    </div>',
                    '    <div id="instructions">',
                    '        <span class="albert">Envoie KEUR pour Albert</span>',
                    '        <span class="pauline">Envoie LOVE pour Pauline</span>',
                    '    </div>',
                    '</div>',
                ].join('');
                var lambda = 0.5;
                if (state.votes.albert != state.votes.pauline) {
                    lambda = state.votes.albert / (state.votes.albert + state.votes.pauline);
                    if (lambda > 0.76) {
                        lambda = 0.76;
                    } else if (lambda < 0.24) {
                        lambda = 0.24;
                    }
                }
                document.getElementById('bar-albert').style.width = ((window.innerWidth - 220) * lambda).toString() + 'px';
                document.getElementById('bar-pauline').style.width = ((window.innerWidth - 220) * (1 - lambda)).toString() + 'px';
            } else if (state.mode == 'question') {
                content.innerHTML = [
                    '<div id="question">' + state.question.formulation + '</div>',
                    '<div id="question-instructions">Envoie ALBERT ou PAULINE par SMS</div>',
                    '<div id="number-of-answers">Nombre de réponses : ' + state.numberOfAnswers.toString() + '</div>'
                ].join('');
            } else if (state.mode == 'answer') {
                content.innerHTML = [
                    '<div id="question">' + state.question.formulation + '</div>',
                    '<div id="answer">' + (state.question.correctAnswer == 0 ? 'Albert' : 'Pauline') + '</div>',
                    '<div id="coeurometre" class="answer">',
                    '    <div id="gauge">',
                    '        <div id="bar-albert" class="bar">', state.answers.albert, '</div>',
                    '        <div id="bar-pauline" class="bar">', state.answers.pauline,'</div>',
                    '        <img class="albert" src="albert.png" alt="albert">',
                    '        <img class="pauline" src="pauline.png" alt="pauline">',
                    '    </div>',
                    '</div>',
                ].join('');
                var lambda = 0.5;
                if (state.answers.albert != state.answers.pauline) {
                    lambda = state.answers.albert / (state.answers.albert + state.answers.pauline);
                    if (lambda > 0.76) {
                        lambda = 0.76;
                    } else if (lambda < 0.24) {
                        lambda = 0.24;
                    }
                }
                document.getElementById('bar-albert').style.width = ((window.innerWidth - 220) * lambda).toString() + 'px';
                document.getElementById('bar-pauline').style.width = ((window.innerWidth - 220) * (1 - lambda)).toString() + 'px';
            } else if (state.mode == 'display') {
                content.innerHTML = '<div id="message">' + state.message + '</div>';
            }
        });
    }
    openSocket(server);
});
