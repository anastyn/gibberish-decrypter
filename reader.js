importScripts('gibberish-aes-1.0.0.js');

GibberishAES.size(256);

class Parser {
    constructor(file, options) {
        this.file = file;
        this.fileSize   = file.size;
        this.chunkSize  = 64 * 1024; // bytes
        this.offset     = 0;
        this.readBlock  = null;
        this.chunkReadCallback = options['chunk_read_callback'];
        this.chunkErrorCallback = function() {};
        this.success = options['success'];
    }
  
    parse() {
        const me = this;

        var onLoadHandler = function(evt) {
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
        }

        this.readBlock = function(_offset, length, _file) {
            var r = new FileReader();
            var blob = _file.slice(_offset, length + _offset);
            r.onload = onLoadHandler;
            r.readAsText(blob);
        }

        this.readBlock(this.offset, this.chunkSize, this.file);
    }
}

onmessage = function(e) {
    const id = e.data[0];
    const encrypted_key = e.data[1];
    const file = e.data[2];
    console.log('Started processing ' + file.name);

    let total_lines = 0;
    const parser = new Parser(file, {
        chunk_read_callback: function(result) {
            const lines = result.split(/\r?\n/);
            for(let line = 0; line < lines.length; line++){
                try {
                    var decoded = GibberishAES.dec(encrypted_key, lines[line]);
                    postMessage([id, false, total_lines + lines.length - line]);
                    postMessage([id, true, `<span style="color:#5cb85c; font-weight:bold;">${decoded}</span>`]);
                    close();
                    return false;
                } catch(e) {}
            }
            total_lines += lines.length;
            postMessage([id, false, total_lines]);
            return true;
        },
        success: function() {
            postMessage([id, true, '<span style="color:#d9534f; font-weight:bold;">not found</span>']);
        }
    });

    parser.parse();
}