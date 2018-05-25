const tap = require('tap');
const sgf = require('../index')

tap.equal(sgf.__sgf_parse_position_unsafe('aa')[0], 0);
tap.equal(sgf.__sgf_parse_position_unsafe('bb')[1], 1);
tap.equal(sgf.__sgf_parse_position_unsafe('ss')[0], 18);
