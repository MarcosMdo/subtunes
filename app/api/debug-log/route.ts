import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { logs } = await request.json();
        
        // Log the current working directory
        console.log('Current working directory:', process.cwd());
        
        const logsDir = path.join(process.cwd(), 'app', 'logs');
        console.log('Logs directory path:', logsDir);
        
        // Check if directory exists
        const dirExists = fs.existsSync(logsDir);
        console.log('Logs directory exists:', dirExists);
        
        if (!dirExists) {
            console.log('Creating logs directory...');
            fs.mkdirSync(logsDir);
        }

        const filename = `debug-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
        const filepath = path.join(logsDir, filename);
        console.log('Writing to file:', filepath);

        fs.writeFileSync(filepath, logs);
        console.log('File written successfully');

        return NextResponse.json({ success: true, filepath });
    } catch (error) {
        console.error('Error details:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to save logs',
            details: error
        }, { status: 500 });
    }
} 