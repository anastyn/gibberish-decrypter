importScripts('gibberish-aes-1.0.0.js');

// Setup the GibberishAES library
GibberishAES.size(256);

class Parser {
    constructor(file, options) {
        this.file = file;
        this.fileSize   = file.size;
        this.chunkSize  = 64 * 1024; // bytes
        this.offset     = 0;
        this.readBlock  = null;
        this.chunkReadCallback = options['chunkReadCallback'];
        this.chunkErrorCallback = function() {};
        this.success = options['success'];
    }
  
    parse() {
        const me = this;

        const onLoadHandler = function(evt) {
            if (evt.target.error == null) {
                me.offset += evt.target.result.length;
                if (!me.chunkReadCallback(evt.target.result)) {
                    return;
                }
            } else {
                me.chunkErrorCallback(evt.target.error);
                return;
            }
            if (me.offset >= me.fileSize) {
                me.success(me.file);
                return;
            }

            me.readBlock(me.offset, me.chunkSize, me.file);
        };

        this.readBlock = function(_offset, length, _file) {
            const r = new FileReader();
            const blob = _file.slice(_offset, length + _offset);
            r.onload = onLoadHandler;
            r.readAsText(blob);
        };

        this.readBlock(this.offset, this.chunkSize, this.file);
    }
}

onmessage = function(e) {
    const id = e.data[0];
    const encryptedString = e.data[1];
    const file = e.data[2];
    console.log('Started processing ' + file.name);

    // keep track of the total lines, for statistics
    let totalLines = 0;
    const parser = new Parser(file, {
        chunkReadCallback: function(result) {
            const lines = result.split(/\r?\n/);
            for(let line = 0; line < lines.length; line++){
                try {
                    const decoded = GibberishAES.dec(encryptedString, lines[line]);
                    postMessage([id, false, totalLines + lines.length - line]);
                    postMessage([id, true, `<span class="found">${decoded}</span>`]);
                    close();
                    return false;
                // ignore, this is going to be thrown for each invalid key
                } catch(e) {}
            }
            totalLines += lines.length;
            postMessage([id, false, totalLines]);
            return true;
        },
        success: function() {
            postMessage([id, true, '<span class="not-found">not found</span>']);
        }
    });

    parser.parse();
};