
import { access, ReadStream, WriteStream } from 'fs'
import fs from 'fs-extra'
import { Duplex, Readable } from 'stream'

export default  function multiple_file_stream(consumer: (readStream: ReadStream, writeStream: WriteStream) => Readable, writeStream: WriteStream, ...files_pathes: string[]) {
    let read_streams = files_pathes.map((file_path) => fs.createReadStream(file_path))
    // Close at the last readed stream
    read_streams[read_streams.length-1].on('end', () => {
        writeStream.close()
    })
    for (let read_stream of read_streams) {
        consumer(read_stream, writeStream)
    }

}
