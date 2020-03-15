const hypershot = require('hypershot');
const fs = require('fs');
const dat = require('dat-node');
const crypto = require('crypto');
const http = require('http');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

const ledgerName = 'ledger.json';
const hostname = '127.0.0.1';
const port = 3000;
const url = 'http://www.google.com';

const server = http.createServer(async(req, res) => {
	if (req.url !== '/') {
		res.end('Nothing to do');
		return;
	}

	// create folder
	const hash = crypto.createHash('md5').update(url).digest('hex');
	const path = './archives/' + hash;
	if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

	// TODO
	// Check is url has already been archived
	// If so clone the dat archive from network (store)
	// Set the owner key
	// Create the new snapshot on the archive
	// Send the new versione to the store
	// Update the ledger with the new snapshot

	console.log('Searching ledger for', url)
	const archiveInfo = findArchiveInfo(url);

	if(archiveInfo) {
		console.log('Ledger contains data about', url);

		console.log('Pulling archive from store!');
		await fetchDatArchive(archiveInfo.key, path);

		console.log('Waiting for the dat to be imported');
		await delay(3000);
		console.log('The store should have finished');

		// todo add keys???

		console.log('Set write key');
		await importKey(path, archiveInfo.write_key);
	} 

	// Create snapshot
	console.log('Creating hypershot');
	const index = await hypershot(url, path);

	dat(path, async(err, dat) => {
		if (err) throw err
	
		dat.importFiles();
		dat.joinNetwork();
		const datUrl = 'dat://' + dat.key.toString('hex');

		exec('./node_modules/dat-store/bin.js add ' + datUrl, async(err) => {
			if (err) throw err
			setTimeout(function() {
				dat.leaveNetwork();
				console.log('Leave network');
			}, 10000);
		});

		await delay(5000);
		const writeKey = await exportKey(path);
		console.log('got write key', writeKey);

		if (fs.existsSync(ledgerName)) {
			ledger = JSON.parse(fs.readFileSync(ledgerName, 'utf8'));
		} else {
			ledger = [];
		}

		ledger.push({
			url: url,
			dat: datUrl,
			hash: hash,
			key: dat.key.toString('hex'),
			write_key: writeKey,
			version: archiveInfo ? archiveInfo.version + 1 : 1,
			dat_version: 0,
		});

		fs.writeFileSync(ledgerName, JSON.stringify(ledger, null, 4));
		res.end(datUrl);
	})
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

/**
 * Get info from ledger or null if the url has never been snapshotted
 * 
 * @param {url} url 
 */
const findArchiveInfo = url => {
	let info;
	if (fs.existsSync(ledgerName)) {
		ledger = JSON.parse(fs.readFileSync(ledgerName, 'utf8'));
		info = ledger.reverse().find(item => item.url == url);
	}

	return info;
}

const fetchDatArchive = async(key, path) => {
	dat(path, {key: key}, (err, dat) => {
		if(err) throw err;
		console.log(`Downloading: ${dat.key.toString('hex')}\n`);
		var network = dat.joinNetwork();
		network.once('connection', () => console.log('Connected'));
	});
}

/**
 * Retrive the write key of a dat archive
 * 
 * @param path Path of the dat archive
 */
const exportKey = async(path) => {
	const currentDir = process.cwd();
	process.chdir(path);
	let writeKey;

	writeKey = await (new Promise((resolve, reject) => {
		exec('dat keys export', (err, stdout) => {
			if(err) throw err;
			resolve(stdout)
		});
	}))

	console.log('Returning key', writeKey);
	process.chdir(currentDir);
	return writeKey;
}

/**
 * Set the owner write key on dat
 * 
 * @param path Path of the dat archive
 * @param key The write key of the dat archive 
 */
const importKey = async(path, key) => {
	const currentDir = process.cwd();
	process.chdir(path);

	await (new Promise((resolve, reject) => {
		const command = spawn('dat', ['keys', 'import']);

		command.stdout.on('data', (data) => {
			command.stdin.write(key);
			resolve();
		});
		
		command.stderr.on('data', (data) => {
		  console.error(data.toString());
		  resolve();
		});
	}))

	console.log('Write key imported');
	process.chdir(currentDir);
}

function delay(t, val) {
	return new Promise(function(resolve) {
		setTimeout(function() {
			resolve(val);
		}, t);
	});
}