function hashKey(value) {
	var type = typeof value;
	var uid;
	if (type === 'object' && value !== null) {
		uid = value.$$hashKey;
		if (typeof uid === 'function') {
			uid = value.hashKey();
		} else if (uid === undefined) {
			uid = _.uniqueId();
		}
	} else {
		uid = value;
	}

	return type + ":" + uid;
}

var a = hashKey({
	"key": "val"
});

console.log(a);