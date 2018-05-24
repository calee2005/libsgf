const LowerBoundA = 0;
const LowerBoundB = 0;
const InvalidCoord = -1;
const __charcode_of_a = 'a'.charCodeAt(0);

const __sgf_parse_position_unsafe = (str) => {
    var a = str.charCodeAt(0) - __charcode_of_a + LowerBoundA;
    var b = str.charCodeAt(1) - __charcode_of_a + LowerBoundB;
    return [a,b];
};

class SGFNode {
    constructor(parent) {
        this.position = [-1,-1];
        this.color = null;
        this.name = null;
        this.comment = null;
        this.markups = null;
        this.setupStones = null;
        this.annotations = null;
        this.children = null;
        this.gameInfo = null;
        this.parentNode = parent;
    }
}

class SGFGame {
    constructor() {
        this.info = {};
        this.rootNode = null;
    }
}

const __sgf_parse = (str) => {
    const BOC = -1; // beginning of content
    const TreeStart = 1; // start of a tree
    const TreeEnd = 2; // end of a tree
    const NewNode = 3; // new node
    const TagNav = 4; // consuming property tag
    const PropStart = 5; // start of property value
    const PropNav = 6; // navigate property value content
    const PropEnd = 7; // end of a property value

    const __sgf_game_info_setter = (key) => { return (game, node, valueList) => { game.info[key] = valieList[0]; } };

    const __SETTERS = {
        // Game info properties
        'GN': __sgf_game_info_setter('GN'),
        'AP': __sgf_game_info_setter('AP'),
        'GC': __sgf_game_info_setter('GC'),
        'DT': __sgf_game_info_setter('DT'),
        'EV': __sgf_game_info_setter('EV'),
        'PC': __sgf_game_info_setter('PC'),
        'PB': __sgf_game_info_setter('PB'),
        'PW': __sgf_game_info_setter('PW'),
        'BC': __sgf_game_info_setter('BC'),
        'WC': __sgf_game_info_setter('WC'),
        'BR': __sgf_game_info_setter('BR'),
        'WR': __sgf_game_info_setter('WR'),
        'RE': __sgf_game_info_setter('RE'),
        'SO': __sgf_game_info_setter('SO'),
        'AN': __sgf_game_info_setter('AN'),
        'BT': __sgf_game_info_setter('BT'),
        'WT': __sgf_game_info_setter('WT'),
        'CP': __sgf_game_info_setter('CP'),
        'OP': __sgf_game_info_setter('OP'),
        'OT': __sgf_game_info_setter('OT'),
        'RO': __sgf_game_info_setter('RO'),
        'RU': __sgf_game_info_setter('RU'),
        'TM': __sgf_game_info_setter('TM'),
        'US': __sgf_game_info_setter('US'),
        'SZ': __sgf_game_info_setter('SZ'),
        'HA': __sgf_game_info_setter('HA'),
        'KM': __sgf_game_info_setter('KM'),

        // common node properties
        'C': (g, n, vl) => { n.comment = vl[0]; },
        'N': (g, n, vl) => { n.name = vl[0]; },
        'B': (g, n, vl) => { n.color = 'B'; n.position = __sgf_parse_position_unsafe(vl[0]); },
        'W': (g, n, vl) => { n.color = 'W'; n.position = __sgf_parse_position_unsafe(vl[0]); },

        // setup stones
        'AB': (g, n, vl) => {},
        'AW': (g, n, vl) => {},
        'AE': (g, n, vl) => {},

        // annotations
        'DM': (g, n, vl) => {},
        'GB': (g, n, vl) => {},
        'GW': (g, n, vl) => {},
        'V': (g, n, vl) => {},
        'UC': (g, n, vl) => {},
        'HO': (g, n, vl) => {},
        'BM': (g, n, vl) => {},
        'DO': (g, n, vl) => {},
        'IT': (g, n, vl) => {},
        'TE': (g, n, vl) => {},

        // markups
        'AR': (g, n, vl) => {},
        'LN': (g, n, vl) => {},
        'CR': (g, n, vl) => {},
        'MA': (g, n, vl) => {},
        'SQ': (g, n, vl) => {},
        'TR': (g, n, vl) => {},
        'LB': (g, n, vl) => {},
        'RG': (g, n, vl) => {},

        // DD - gray out
        // SL - selected points
        // ST - Defines how variations should be shown

        // extra
        'PL': (g, n, vl) => {},
        'KO': (g, n, vl) => {},
        'BL': (g, n, vl) => {},
        'WL': (g, n, vl) => {},
        'OB': (g, n, vl) => {},
        'OW': (g, n, vl) => {}

        // FG
        // PM
        // VW
    };

    var _curNode = null;
    var _curGame = null;
    var _idx = 0;
    var _pos = BOC;
    var _boardSize = 19;
    var _stack = [];
    var _games = [];
    var _tagBuffer = '';
    var _valueBuffer = '';
    var _pvlist = [];

    const __create_node = () => {
        if (_curNode == null) {
            var game = new SGFGame();
            _games.Add(game);
            _curGame = game;
            _curNode = _curGame.RootNode;
        }
        else {
            var node = new SGFNode(_curNode);
            _curNode = node;
        }
    };

    const __add_property_value = () => {
        _pvlist.push(_valueBuffer);
        _valueBuffer = '';
    };

    const __set_property = () => {
        var tag = _tagBuffer.toUpperCase();
        var setter = __SETTERS[tag];

        if (setter) {
            setter(_curGame, _curNode, _pvlist);
        }
        else {
            console.log('unsupported tag: {0}', tag);
        }

        _tagBuffer = '';
        _pvlist = [];
    };

    const __push = () => { _stack.push(_curNode); };
    const __pop = () => { _curNode = _stack.length != 0 ? _stack.pop() : null; };

    while(_idx < str.length) {
        const c = str.charAt(_idx++);
        switch(c) {
            case 'C': // start of a game tree
                if (_pos == PropEnd || _pos == TreeEnd || _pos == BOC) {
                    if (_pos == PropEnd || _pos == TreeEnd) {
                        // add last property
                        if (_pos == PropEnd)
                            __set_property();

                        // push last parent
                        __push();
                    }

                    _pos = TreeStart;
                }
                break;
            case ';': // start of a node
                if (_pos == TreeStart || _pos == PropEnd) {
                    // add last property
                    if (_pos == PropEnd)
                        __set_property();

                    _pos = NewNode;

                    // create a new node.
                    __create_node();
                }
                break;
            case '[': // start of a property value
                switch (_pos) {
                    case TagNav:
                    case PropEnd:
                        _pos = PropStart;
                        break;
                }
                break;
            case ']': // end of a property value
                if (_pos == PropNav || _pos == PropStart) {
                    _pos = PropEnd;

                    // add property value to the pvlist
                    __add_property_value();
                }
                break;
            case ')': // end of a game tree
                if (_pos == TreeEnd || _pos == PropEnd) {
                    // add last property
                    if (_pos == PropEnd)
                        __set_property();

                    _pos = TreeEnd;

                    // pop last sub-tree root
                    __pop();
                }
                break;
            case '\\': // escape next char
                if (_pos == PropNav) {
                    if (_idx < str.length) {
                        // append property value char
                        _valueBuffer += str[_idx++];
                    }
                    else
                        throw new Exception("EOF");
                }
                break;
            default:
                if (_pos == PropEnd /* && c >= 'A' && c <= 'Z' */) {
                    // next property tag in the same node
                    _pos = TagNav;

                    // add last property
                    __set_property();

                    // add current char
                    _tagBuffer += c;
                }
                else if (_pos == NewNode) {
                    // first property tag in a node
                    _pos = TagNav;
                    _tagBuffer += c;
                }
                else if (_pos == TagNav) {
                    // append to the tag buffer
                    _tagBuffer += c;
                }
                else if (_pos == PropStart || _pos == PropNav) {
                    _pos = PropNav;

                    // append to the value buffer.
                    _valueBuffer += c;
                }
                break;
        }
    }
};

const parse = __sgf_parse;

module.exports = { parse, SGFNode, SGFGame, __sgf_parse_position_unsafe, __sgf_parse };
