var fecs = require('../index');

describe('API', function () {

    it('getOptions', function () {
        var options = fecs.getOptions();
        expect(options._).toEqual([]);
    });

    it('leadName', function () {
        var name = fecs.leadName;
        var pkg = require('../package');

        expect(name).toBe(pkg.name);

        name = 'foo';
        fecs.leadName = name;
        expect(fecs.leadName).toBe(name);
        fecs.leadName = pkg.name;
    });

    it('check', function () {
        expect(typeof fecs.check).toBe('function');
    });

    it('format', function () {
        expect(typeof fecs.format).toBe('function');
    });
});
