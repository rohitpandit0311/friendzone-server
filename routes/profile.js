const express = require('express');
const sharp = require('sharp');
const router = express.Router();
const User = require('../models/userModel');
const multer = require('multer');
const fs = require('fs');
const util = require('util');

//promisify the fs module functions
const mkdirAsync = util.promisify(fs.mkdir);
const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);

//multer
// const storage = multer.memoryStorag;
const upload = multer({
	dest: './uploads',
});

router.get('/', async (req, res) => {
	try {
		if (req.userId) {
			res.status(401).json({ message: 'Unauthorized user' });
			return;
		}
		console.log(req.userId);

		console.log('GET----------------------');
		const id = req.userId;

		const user = await User.findOne({ _id: id }).select('-password');
		const { name, gender, aboutMe, country, dob, count, avtar } = user;

		const userInfo = { name, gender, aboutMe, country, dob, count, avtar };
		console.log(userInfo);

		//avtar sending logic
		// if (user.avtarUrl) {
		// 	const avtar = await readFileAsync(user.avtarUrl);
		// 	// const stream = fs.createReadStream(user.avtarUrl);
		// 	// console.log(avtar);
		// 	userInfo['avtar'] = avtar;
		// }

		console.log('----------------------GET');
		res.status(200).json({ user: userInfo });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error });
	}
});

router.put('/', upload.single('avtar'), async (req, res) => {
	try {
		console.log('PUT***********************');
		const id = req.userId;
		const { name, gender, dob, country, aboutMe } = req.body;
		const avtar = req.file;
		// console.log(avtar);

		//saving the file in the server
		// if (avtar) {
		// 	const saveDir = `./upload/${id}`;
		// 	await mkdirAsync(saveDir, { recursive: true });
		// 	const fileName = `${saveDir}/1.${avtar.originalname.split('.')[1]}`;
		// 	await writeFileAsync(fileName, avtar.buffer);

		// 	//saving a compressed version of the avtar for calling at as small images
		// 	const compressedDir = `compress/${id}`;
		// 	await mkdirAsync(compressedDir, { recursive: true });
		// 	const compressedFile = `${compressedDir}/1.jpg`;

		// 	sharp(fileName).resize(50, 50).resize(50, 50).toFile(compressedFile);
		// }

		//SAVING The avtar image in the db

		const user = await User.findOne({ _id: id }).select('-password');

		if (!user) {
			res.status(400).json({ message: 'User not found!' });
			return;
		}

		if (name) {
			user.name = name;
		}
		if (gender) {
			user.gender = gender;
		}
		if (dob) {
			user.dob = dob;
		}
		if (country) {
			user.country = country;
		}
		if (aboutMe) {
			user.aboutMe = aboutMe;
		}
		if (avtar) {
			console.log('avtar found', avtar);
			let data = '';
			// user.avtar.data = await readFileAsync(`./uploads/${avtar.filename}`);
			const readStream = fs.createReadStream(`./uploads/${avtar.filename}`);

			readStream
				.on('data', (chunk) => {
					data += chunk;
				})
				.on('end', () => {
					user.avtar.data = Buffer.from(data);
				});
		}

		await user.save();
		console.log('user', user);

		console.log('*****************************PUT');

		res.status(200).json({ user: user });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error });
	}
});

module.exports = router;
