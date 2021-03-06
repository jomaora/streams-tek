const {
	Readable,
	Writable,
	Transform,
	pipeline
} = require('stream') ;
const {
	createReadStream
} = require('fs');

class AlphabetReadable extends Readable {
	constructor() {
		super({
			objectMode: true,
			//highWaterMark
		});
		this.letters = 'abcedfghijklmnopqrstuvwxyz'.split('');
	}

	// Les readables ont une méthode _read avec un param la taille, le nombre d'elements à fetcher
	// Les readbles ont une fin, pour l'exprimer on renvoie un null dans le this.push
	// Attention a ne pas surcharger read, c'est _read qu'il faut créer
	// L'autre syntaxe pour déclare un stream est celle avec l'objet en param dans le constructeur
	_read(size) {
		console.log('ça vient du highwatermark', {size});

		while (size--) {
			this.push(this.letters.shift());

			if (this.letters.length === 0) {
				return this.push(null);
			}
		}
	}
}

class ChuckTrandorm extends Transform {
	constructor() {
		super({
			objectMode: true,
			//highWaterMark
		});
		this.buffer = [];
	}

	_transform(chunk, encoding, cb) {
		this.buffer.push((chunk));
		if (this.buffer.length == 10) {
			this.push(this.buffer);
			this.buffer = [];
		}
		cb();
	}

	// il est appelé quand il sait que son Readable a émis un null
	_flush(cb) {
		throw new Error('yolo');
		cb(null, this.buffer);
	}
}

/*new AlphabetReadable()
	.pipe(new Transform({
		objectMode: true,
		transform(chunk, encoding, cb) {
			// si je veux juste envoyer un seul element transformé
			//(null, chunk.toUpperCase());
			// si je veux envoyer plusiers element à la fois on appele this.push
			this.push(chunk)
			cb(null, chunk.toUpperCase());
		}
	}))
	.pipe(new ChuckTrandorm())
	// Pour le erreurs c'est mieux de mettre un .on('error' après chaque pipe
	.pipe(new Writable({
		objectMode: true,
		write(chunk, encoding, cb) {
			console.log(chunk.toString());
			cb();
		}
	}));
*/

pipeline(
	new AlphabetReadable(),
	new Transform({
		objectMode: true,
		transform(chunk, encoding, cb) {
			this.push(chunk)
			cb(null, chunk.toUpperCase());
		}
	}),
	new ChuckTrandorm(),
	// un seul writable par pipeline
	new Writable({
		objectMode: true,
		write(chunk, encoding, cb) {
			console.log(chunk.toString());
			cb();
		}
	}),
	err => {
		console.log(err);
	}
);