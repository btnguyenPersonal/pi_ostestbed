const multer = require('multer');
const db = require("..");
const Computer = db.computer;

exports.uploader = async (req, res, next) => {
	var computerId = req.params.id;
	let theComputer = await Computer.findByPk(computerId);
	if(!theComputer) {
	  res.status(400).send({
		message: "Computer ID: " + computerId + " doesnt exist.",
	  });
	  return;
	}
	const serialNumber = theComputer.serialNumber;
	
	//storage details - path and file name
	var storage = multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, '/srv/tftp/' + serialNumber + '/');
		},
		filename: function(req, file, cb) {
			cb(null, 'kernel7.img');
		}
	});
	
	//filters out wrong file types
	const fileFilter = (req, file, cb) => {
		if(file.mimetype === 'application/octet-stream')
			cb(null, true);
		else
			cb(new Error('Unsupported file type'), false);
	};
	
	var upload = multer({
		storage: storage, 
		limits: {
			fileSize: 30 * 1024 * 1024
			},
		fileFilter: fileFilter
	}).single('imgFile');
	
	upload (req, res, (err) => {
		if(!err)
			next();
		else if (err.code === 'LIMIT_FILE_SIZE')
			return res.status(400).send({ message: 'File size too large' });
		else if(err instanceof multer.MulterError)
			return res.status(500).send({ message: 'File upload error' });
		else
			return res.status(400).send({ message: err.message });
	});
};
