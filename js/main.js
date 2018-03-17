(function($) {

    // keep the list of the created web workers
    const workers = [];

    $(document).ready(function() {

        $('form#decryptionForm').submit(function(e){
            // prevent form submit
            e.preventDefault();

            // remove previously loaded results, if any
            $('#results tr').remove();

            // stop all running workers
            while (workers.length > 0) {
                const worker = workers.pop();
                worker.terminate();
            }

            const encryptedString = $('#text').val();
            // password dictionaries
            const dictionaries = $('#files')[0].files;

            let workerId = 0;
            for (const dictionary of dictionaries) {
                $('#results tbody').append(`<tr><td>${dictionary.name}</td><td id=t${workerId}>waiting...</td><td id=p${workerId}>--</td></tr>`);
                worker = new Worker('js/reader.js');
                worker.postMessage([workerId, encryptedString, dictionary]);
                worker.onmessage = function(e) {
                    const workerId = e.data[0];
                    const finished = e.data[1];
                    const msg = e.data[2];

                    if (finished) {
                        $('#p' + workerId).html(msg);
                    } else {
                        $('#t' + workerId).html(msg);
                    }
                };
                workers.push(worker);
                workerId++;
            }
        });
    });

})($);