import { createServer } from 'http';
import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';

// Create an HTTP and WebSocket server
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    let currentDataId: string | null = null;
    let mode: 'connect' | 'verify' | null = null;

    // 啟動日誌捕獲腳本
    const logCaptureProcess = spawn('bash', ['./getlog.sh']);

    logCaptureProcess.on('error', (error) => {
      console.error('Log capture script failed:', error);
    });

    // 處理日誌檔案
    const tailProcess = spawn('tail', ['-f', '/logfile.log']);  
    tailProcess.stdout.on('data', (data: Buffer)=>{
      const lines = data.toString().split('\n');

      for (const line of lines) {
          if (line.includes('[Trust Chain] start connect')) {
              mode = 'connect';
              continue;
          } else if (line.includes('[Trust Chain] verify authorization for')) {
              mode = 'verify';
              continue;
          }

          switch (mode) {
              case 'connect':
                  if (line.includes('[Consumer] consumer received:')) {
                      const match = line.match(/data_id: '(\d+)'/);
                      if (match && match[1]) {
                          currentDataId = match[1];
                          ws.send(JSON.stringify({ status: 'processing', dataId: currentDataId }));
                      }
                  } else if (line.includes('[upto_blockchain] data up to blockchain for data') && currentDataId) {
                      ws.send(JSON.stringify({ status: 'success', dataId: currentDataId }));
                      currentDataId = null; // Reset after success
                  } else if (line.includes('error') && currentDataId) {
                      ws.send(JSON.stringify({ status: 'failed', dataId: currentDataId }));
                      currentDataId = null; // Reset after failure
                  }
                  break;
              case 'verify':
                  // Implement the logic specific to 'verify' mode when needed
                  break;
          }
      }
    });
    tailProcess.on('error', (error) => {
      console.error('Error in tail process:', error);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      tailProcess.kill();  // Stop the tail process when client disconnects
      logCaptureProcess.kill();  // Stop the log capture script when client disconnects
    });
});

server.listen(8080, () => {
    console.log('WebSocket server started on port 8080');
});
