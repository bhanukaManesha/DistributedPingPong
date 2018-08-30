"use strict";
function pong() {
    class SessionData {
        constructor() {
        }
    }
    SessionData.session_data = {
        current_paddle: undefined,
        opponent_paddle: undefined,
        current_ball: undefined,
        gameplay_main: () => null,
        end_cpu_paddle_movement: () => null,
        end_ball_movement: () => null
    };
    SessionData.game_data = {
        "score_left": 0,
        "score_right": 0,
        "round_started": false,
        "start_direction": 1
    };
    class Settings {
    }
    Settings.settings = {
        "table_height": 600,
        "table_width": 600,
        "game_speed": 2,
        "ball_speed": 2,
        "player_side": "left",
        "game_point": 2,
        "paddle_height": 100,
        "dash_gap": 20,
        "padding": 50
    };
    class GameSound {
    }
    GameSound.game_sound = {
        collision: new Audio(),
        fail: new Audio()
    };
    class PongTable {
        constructor(svg) {
            this.paddle = null;
            this.setDefaultPlayerSide = () => {
                Settings.settings.player_side === "left" ?
                    (SessionData.session_data.current_paddle = this.createPaddle(Settings.settings.paddle_height, "left"),
                        SessionData.session_data.opponent_paddle = this.createPaddle(Settings.settings.paddle_height, "right"))
                    : (SessionData.session_data.current_paddle = this.createPaddle(Settings.settings.paddle_height, "right"),
                        SessionData.session_data.opponent_paddle = this.createPaddle(Settings.settings.paddle_height, "left"));
            };
            this.paddle_movement = (paddle) => (y_cord) => {
                paddle.attr("y", y_cord);
            };
            this.move_paddle = (paddle) => {
                const o = Observable
                    .fromEvent(HTMLPage.svg, "mousemove")
                    .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }));
                o.map(({ x, y }) => `${y}`)
                    .map(y => (Number(y) - Number(HTMLPage.svg.style.paddingTop) - HTMLPage.svg.getBoundingClientRect().top) - Number(paddle.attr("height")) / 2)
                    .filter((y) => y <= (Number(HTMLPage.svg.getAttribute("height"))) - Number(paddle.attr("height")) - Settings.settings.padding && y >= Settings.settings.padding)
                    .subscribe(y => this.paddle_movement(paddle)(y.toString()));
                o.subscribe(_ => HTMLPage.svg.style.cursor = "none");
            };
            this.initalizeTable = (svg) => {
                const dash = (y) => new Elem(svg, 'rect')
                    .attr('width', 5)
                    .attr('height', 10)
                    .attr('x', Number(svg.getAttribute("width")) / 2 - 2.5)
                    .attr('y', Number(y))
                    .attr('fill', '#FFF'), dashed_line = (gap) => {
                    const dashed_line_aux = (y_value) => {
                        return (Settings.settings.padding > y_value) ? 0 : (dash(y_value), dashed_line_aux(y_value - gap));
                    };
                    dashed_line_aux(Number(svg.getAttribute("y")) + Number(svg.getAttribute("height")) - gap - Settings.settings.padding);
                }, score = () => {
                    new Elem(svg, "text")
                        .attr("x", Number(svg.getAttribute("width")) / 4)
                        .attr("y", Number(svg.getAttribute("height")) * 2 / 8)
                        .attr("font-size", 100)
                        .attr("fill", "white")
                        .attr("id", "score1")
                        .attr("font-family", "Impact"),
                        document.getElementById("score1").textContent = SessionData.game_data.score_right.toString(),
                        new Elem(svg, "text")
                            .attr("x", Number(svg.getAttribute("width")) * 3 / 4)
                            .attr("y", Number(svg.getAttribute("height")) * 2 / 8)
                            .attr("font-size", 100)
                            .attr("fill", "white")
                            .attr("id", "score2")
                            .attr("font-family", "Impact"),
                        document.getElementById("score2").textContent = SessionData.game_data.score_left.toString();
                };
                dashed_line(Settings.settings.dash_gap);
                score();
            };
            this.initalizeTable(svg);
            this.setDefaultPlayerSide();
            SessionData.session_data.current_ball = new Ball();
        }
        createPaddle(height, side) {
            if (side == "left") {
                return this.paddle = new Elem(HTMLPage.svg, 'rect')
                    .attr("id", "paddle_left")
                    .attr('width', 5)
                    .attr('height', Number(height))
                    .attr('x', Number(HTMLPage.svg.getAttribute("x")) + 40)
                    .attr('y', Number(HTMLPage.svg.getAttribute("height")) / 2 + Number(HTMLPage.svg.getAttribute("t")) / 2)
                    .attr('fill', '#FFF');
            }
            else {
                return this.paddle = new Elem(HTMLPage.svg, 'rect')
                    .attr("id", "paddle_right")
                    .attr('width', 5)
                    .attr('height', Number(height))
                    .attr('x', Number(HTMLPage.svg.getAttribute("x")) + Number(HTMLPage.svg.getAttribute("width")) - 40)
                    .attr('y', Number(HTMLPage.svg.getAttribute("height")) / 2 + Number(HTMLPage.svg.getAttribute("t")) / 2)
                    .attr('fill', '#FFF');
            }
        }
        getPaddle() {
            return this.paddle;
        }
    }
    class Ball {
        constructor() {
            this.ball_movement = (ball_starting_direction) => {
                const gradients = [0, -Settings.settings.ball_speed, Settings.settings.ball_speed, -Settings.settings.ball_speed - 1, Settings.settings.ball_speed + 1];
                let x_change = gradients[2] * ball_starting_direction;
                let y_change = Math.floor((Math.random() * 3));
                const getBallDirection = (x_cord, y_cord, paddle) => {
                    const paddle_collison = () => {
                        return (Number(x_cord) - Number(this.ball.attr("r")) < Number(paddle.attr("x")) + Number(paddle.attr("width"))
                            && Number(x_cord) + Number(this.ball.attr("r")) > Number(paddle.attr("x")) - Number(paddle.attr("width"))
                            && Number(y_cord) + Number(this.ball.attr("r")) > Number(paddle.attr("y"))
                            && Number(y_cord) < Number(paddle.attr("y")) + Number(paddle.attr("height")) + Number(this.ball.attr("r")));
                    };
                    const direction_change = () => {
                        GameSound.game_sound.collision.play();
                        if (Number(y_cord) > Number(paddle.attr("y")) + (Number(paddle.attr("height")) / 2 + (Number(paddle.attr("height")) / 2) * 0.1)) {
                            if (Number(y_cord) > Number(paddle.attr("y")) + (Number(paddle.attr("height")) / 2 + Number(paddle.attr("height")) * 0.4)) {
                                return (x_change = (-x_change * gradients[4]), y_change = gradients[3], { x: x_cord, y: y_cord });
                            }
                            else {
                                return (x_change = (-x_change), y_change = gradients[2], { x: x_cord, y: y_cord });
                            }
                        }
                        else if (Number(y_cord) < Number(paddle.attr("y")) + (Number(paddle.attr("height")) / 2 - (Number(paddle.attr("height")) / 2) * 0.1)) {
                            if (Number(y_cord) < Number(paddle.attr("y")) + (Number(paddle.attr("height")) / 2 - Number(paddle.attr("height")) * 0.4)) {
                                return (x_change = (-x_change * gradients[4]), y_change = gradients[3], { x: x_cord, y: y_cord });
                            }
                            else {
                                return (x_change = (-x_change), y_change = gradients[1], { x: x_cord, y: y_cord });
                            }
                        }
                        else {
                            return (x_change = (-x_change), y_change = gradients[Math.floor((Math.random() * 3))], { x: x_cord, y: y_cord });
                        }
                    };
                    return paddle_collison() ?
                        (direction_change())
                        :
                            { x: x_cord, y: y_cord };
                };
                return Observable.interval(Settings.settings.game_speed)
                    .map(s => ({ x: this.ball.attr('cx'), y: this.ball.attr('cy') }))
                    .map(({ x, y }) => getBallDirection(x, y, SessionData.session_data.current_paddle))
                    .map(({ x, y }) => getBallDirection(x, y, SessionData.session_data.opponent_paddle))
                    .map(({ x, y }) => Number(y) > Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.ball.attr("r")) ?
                    (GameSound.game_sound.collision.play(), y_change = (-y_change),
                        { x: x, y: y })
                    :
                        (y_change = y_change,
                            { x: x, y: y }))
                    .map(({ x, y }) => Number(y) < Settings.settings.padding + Number(this.ball.attr("r")) ?
                    (GameSound.game_sound.collision.play(), y_change = (-y_change),
                        { x: x, y: y })
                    :
                        (y_change = y_change,
                            { x: x, y: y }))
                    .map(({ x, y }) => ({ x: x_change + Number(x), y: y_change + Number(y) }))
                    .subscribe(({ x, y }) => (this.ball.attr('cx', x),
                    this.ball.attr('cy', y)));
            };
            this.ball = new Elem(HTMLPage.svg, 'circle')
                .attr("id", "ball")
                .attr('cx', Number(HTMLPage.svg.getAttribute("width")) / 2)
                .attr('cy', Number(HTMLPage.svg.getAttribute("height")) / 2)
                .attr('r', 8)
                .attr('fill', '#FFF');
        }
        getBall() {
            return this.ball;
        }
    }
    class CPUPaddleMovement {
        constructor(paddle) {
            this.cpu_paddle_movement = () => {
                const paddle_increment = Settings.settings.ball_speed, increment = (y) => {
                    if (Number(this.paddle.attr("y")) + Number(this.paddle.attr("height")) / 2 < y) {
                        return Number(this.paddle.attr("y")) + paddle_increment;
                    }
                    else if (Number(this.paddle.attr("y")) + Number(this.paddle.attr("height")) / 2 > y) {
                        return Number(this.paddle.attr("y")) - paddle_increment;
                    }
                    else {
                        return Number(this.paddle.attr("y"));
                    }
                };
                return Observable.interval(Settings.settings.game_speed)
                    .map(s => ({ y: SessionData.session_data.current_ball.getBall().attr('cy') }))
                    .filter((y) => !(Number(y) <= (Number(HTMLPage.svg.getAttribute("height"))) - (Number(this.paddle.attr("height")) / 2) - Settings.settings.padding) && !(Number(y) >= Settings.settings.padding))
                    .map(({ y }) => ({ y: increment(Number(y)) }))
                    .subscribe(({ y }) => (this.paddle.attr("y", y.toString())));
            };
            this.paddle = paddle;
        }
        getCPUPaddleMovement() {
            return this.cpu_paddle_movement;
        }
    }
    class Gameplay {
        constructor() {
            this.setHTMLPage = (html) => {
                this.htmlPage = html;
            };
            this.gameplay = () => {
                const mouseup = Observable.fromEvent(HTMLPage.svg, 'mouseup')
                    .filter(s => !Multiplayer.MULTIPLAYER_STATUS)
                    .filter((s => !this.game_data.round_started))
                    .subscribe(s => this.startRound());
                this.session_data.gameplay_main = Observable.interval(Settings.settings.game_speed)
                    .map(s => ({ x: this.session_data.current_ball.getBall().attr('cx') }))
                    .subscribe(({ x }) => {
                    if (Number(x) < (Number(HTMLPage.svg.getAttribute("x")) - Number(this.session_data.current_ball.getBall().attr("r")))) {
                        GameSound.game_sound.fail.play();
                        this.game_data.score_right += 1;
                        document.getElementById("score2").textContent = (this.game_data.score_right).toString();
                        this.session_data.end_ball_movement();
                        this.session_data.end_cpu_paddle_movement();
                        this.session_data.current_ball.getBall().attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                            .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2);
                        this.game_data.round_started = false;
                        this.game_data.start_direction = -1;
                        this.htmlPage.getGameBanner().textContent = "Right is Serving";
                    }
                    else if (Number(x) > (Number(HTMLPage.svg.getAttribute("x")) + Number(this.session_data.current_ball.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width")))) {
                        GameSound.game_sound.fail.play();
                        this.game_data.score_left += 1;
                        document.getElementById("score1").textContent = (this.game_data.score_left).toString();
                        this.session_data.end_ball_movement();
                        this.session_data.end_cpu_paddle_movement();
                        this.session_data.current_ball.getBall().attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                            .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2);
                        this.game_data.round_started = false;
                        this.game_data.start_direction = 1;
                        this.htmlPage.getGameBanner().textContent = "Left is Serving";
                    }
                    if (this.game_data.score_left >= Settings.settings.game_point || this.game_data.score_right >= Settings.settings.game_point) {
                        GameSound.game_sound.fail.play();
                        this.session_data.gameplay_main();
                        mouseup();
                        this.session_data.end_ball_movement();
                        this.session_data.end_cpu_paddle_movement();
                        this.session_data.current_ball.getBall().attr("r", 0);
                        this.htmlPage.getPlayerTurn().textContent = "Wanna play again?";
                        this.game_data.score_left > this.game_data.score_right ? this.htmlPage.getGameBanner().textContent = "Left Won the Game" : this.htmlPage.getGameBanner().textContent = "Right Won the Game";
                        document.getElementById("start").textContent = "Play Again";
                        this.game_data.round_started = true;
                    }
                });
            };
            this.htmlPage = undefined;
            this.session_data = SessionData.session_data;
            this.game_data = SessionData.game_data;
        }
        startRound() {
            this.game_data.round_started = true;
            this.session_data.end_ball_movement = this.session_data.current_ball.ball_movement(this.game_data.start_direction);
            let cpu = new CPUPaddleMovement(this.session_data.opponent_paddle);
            this.session_data.end_cpu_paddle_movement = cpu.getCPUPaddleMovement()();
        }
    }
    class HTMLPage {
        constructor(gameplay) {
            this.game_banner = document.getElementById("game_state_banner");
            this.player_turn = document.getElementById("player_turn");
            this.init = () => {
                Settings.settings.player_side === "left" ? document.getElementById("left_side").checked = true : document.getElementById("right_side").checked = true,
                    document.getElementById("theight").value = Settings.settings.table_height.toString(),
                    document.getElementById("twidth").value = Settings.settings.table_width.toString(),
                    document.getElementById("ball_speed").value = Settings.settings.ball_speed.toString(),
                    document.getElementById("frame_rate").value = Settings.settings.game_speed.toString(),
                    document.getElementById("game_point").value = Settings.settings.game_point.toString(),
                    document.getElementById("paddle_height").value = Settings.settings.paddle_height.toString(),
                    document.getElementById("dash_gap").value = Settings.settings.dash_gap.toString(),
                    document.getElementById("padding").value = Settings.settings.padding.toString();
            };
            this.update = () => {
                let svg = document.getElementById("canvas"), updategame = () => {
                    let pongTable = new PongTable(HTMLPage.svg);
                    pongTable.move_paddle(SessionData.session_data.current_paddle);
                };
                confirm("THE GAME IS STILL IN BETA. If you wish to update the settings, do at your own RISK. The game may crash on some combinations. If it crashes you will have to reload the page.  Do you wish to continue? ") ?
                    (document.getElementById("left_side").checked ?
                        Settings.settings.player_side = "left" : Settings.settings.player_side = "right",
                        Settings.settings.table_height = Number(document.getElementById("theight").value),
                        Settings.settings.table_width = Number(document.getElementById("twidth").value),
                        Settings.settings.ball_speed = Number(document.getElementById("ball_speed").value),
                        Settings.settings.game_speed = Number(document.getElementById("frame_rate").value),
                        Settings.settings.game_point = Number(document.getElementById("game_point").value),
                        Settings.settings.paddle_height = Number(document.getElementById("paddle_height").value),
                        Settings.settings.dash_gap = Number(document.getElementById("dash_gap").value),
                        Settings.settings.padding = Number(document.getElementById("padding").value),
                        HTMLPage.clearAllChildren(svg),
                        document.getElementById("canvas").setAttribute("height", Settings.settings.table_height.toString()),
                        document.getElementById("canvas").setAttribute("width", Settings.settings.table_width.toString()),
                        updategame())
                    :
                        undefined;
            };
            this.start_game = () => {
                SessionData.session_data.gameplay_main ? (SessionData.session_data.gameplay_main(), SessionData.session_data.end_ball_movement(), SessionData.session_data.end_cpu_paddle_movement()) : undefined;
                console.log("started restart");
                SessionData.game_data.score_left = 0;
                SessionData.game_data.score_right = 0;
                SessionData.game_data.round_started = false;
                SessionData.game_data.start_direction = 1;
                HTMLPage.clearAllChildren(HTMLPage.svg);
                let pongTable = new PongTable(HTMLPage.svg);
                pongTable.move_paddle(SessionData.session_data.current_paddle);
                this.gamePlay.gameplay();
                this.player_turn.textContent = "Game Started";
                this.game_banner.textContent = "Left is Serving";
                document.getElementById("start").textContent = "Restart Game";
            };
            this.loadSound = () => {
                GameSound.game_sound.collision.src = "sound/knock.wav";
                GameSound.game_sound.fail.src = "sound/fail.wav";
            };
            this.getGameBanner = () => {
                return this.game_banner;
            };
            this.getPlayerTurn = () => {
                return this.player_turn;
            };
            this.gamePlay = gameplay;
            this.gamePlay.setHTMLPage(this);
            this.game_banner = document.getElementById("game_state_banner");
            this.player_turn = document.getElementById("player_turn");
            this.init();
            document.getElementById("start").onclick = this.start_game;
            document.getElementById("update").onclick = this.update;
            document.getElementById("singleplayer_button").onclick = Multiplayer.switchToSP;
            this.loadSound();
        }
    }
    HTMLPage.svg = document.getElementById("canvas");
    HTMLPage.clearAllChildren = (svg) => {
        let count = svg.childElementCount;
        while (count > 0) {
            svg.removeChild(svg.firstChild);
            count--;
        }
    };
    class Multiplayer {
        constructor(htmlPage) {
            this.host_gameplay = () => {
                let mouseup = () => null;
                if (this.SOCKETID === this.USERS[0]) {
                    mouseup = Observable.fromEvent(HTMLPage.svg, 'mouseup')
                        .filter((s => !SessionData.game_data.round_started))
                        .subscribe(s => (SessionData.game_data.round_started = true, SessionData.session_data.end_ball_movement = SessionData.session_data.current_ball.ball_movement(SessionData.game_data.start_direction)));
                }
                SessionData.session_data.gameplay_main = Observable.interval(0.5)
                    .map(s => ({ x: SessionData.session_data.current_ball.getBall().attr('cx') }))
                    .subscribe(({ x }) => {
                    if (Number(x) < (Number(HTMLPage.svg.getAttribute("x")) - Number(SessionData.session_data.current_ball.getBall().attr("r")))) {
                        GameSound.game_sound.fail.play();
                        SessionData.game_data.score_right += 1;
                        document.getElementById("score2").textContent = (SessionData.game_data.score_right).toString();
                        SessionData.session_data.end_ball_movement();
                        SessionData.session_data.current_ball.getBall().attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                            .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2);
                        SessionData.game_data.round_started = false;
                        SessionData.game_data.start_direction = -1;
                        this.html_page.getPlayerTurn().textContent = "Right is Serving";
                    }
                    else if (Number(x) > (Number(HTMLPage.svg.getAttribute("x")) + Number(SessionData.session_data.current_ball.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width")))) {
                        GameSound.game_sound.fail.play();
                        SessionData.game_data.score_left += 1;
                        document.getElementById("score1").textContent = (SessionData.game_data.score_left).toString();
                        SessionData.session_data.end_ball_movement();
                        SessionData.session_data.current_ball.getBall().attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                            .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2);
                        SessionData.game_data.round_started = false;
                        SessionData.game_data.start_direction = 1;
                        this.html_page.getPlayerTurn().textContent = "Left is Serving";
                    }
                    if (SessionData.game_data.score_left >= Settings.settings.game_point || SessionData.game_data.score_right >= Settings.settings.game_point) {
                        GameSound.game_sound.fail.play();
                        SessionData.session_data.gameplay_main();
                        if (this.SOCKETID === this.USERS[0]) {
                            mouseup();
                        }
                        SessionData.session_data.end_ball_movement();
                        SessionData.session_data.current_ball.getBall().attr("r", 0);
                        this.html_page.getPlayerTurn().textContent = "Wanna play again?";
                        SessionData.game_data.score_left > SessionData.game_data.score_right ? this.html_page.getGameBanner().textContent = "Left Won the Game" : this.html_page.getGameBanner().textContent = "Right Won the Game";
                        document.getElementById("start").textContent = "Play Again";
                        document.getElementById("start").onclick = this.startMultiplayerGame;
                        document.getElementById("start").style.display = "block";
                        document.getElementById("player_turn").style.display = "none";
                        SessionData.game_data.round_started = true;
                    }
                });
            };
            this.createGame = () => {
                const generateGameId = () => {
                    const socket = io(), _this = this;
                    socket.emit('new_game');
                    let allocated = [];
                    allocated[0] = false;
                    socket.on('game_id', function (res) {
                        _this.updatePlayerHost(res, allocated);
                    });
                };
                this.createLobby();
                generateGameId();
            };
            this.joinGame = () => {
                let game_id = document.getElementById("join_game_id").value;
                if (game_id == "") {
                    alert("Did you enter a Game ID?");
                }
                else {
                    const socket = io(), _this = this;
                    socket.emit('join_game', game_id.toString());
                    socket.on('join', function (res) {
                        _this.updatePlayerClient(res);
                    });
                }
            };
            document.getElementById("creategame").onclick = this.createGame;
            document.getElementById("joingame").onclick = this.joinGame;
            this.USERS = [];
            this.GAMEID = null;
            this.SOCKETID = null;
            this.PLAYERID = null;
            this.html_page = htmlPage;
        }
        createLobby(game_id = undefined) {
            document.getElementById("lobby").style.display = "block";
            document.getElementById("game").style.display = "none";
            document.getElementById("options").style.display = "none";
            document.getElementById("singleplayer").style.display = "block";
            document.getElementById("multiplayer").style.display = "none";
            Multiplayer.MULTIPLAYER_STATUS = true;
            game_id ? document.getElementById("gameid").textContent = "Game ID :" + game_id : undefined;
            this.updateLobbyPlayers();
        }
        updateLobbyPlayers() {
            const _this = this, socket = io();
            let trying_count = 0;
            socket.on('player_update', function (res) {
                _this.updateLobbyTable(res, socket, trying_count);
            });
        }
        startMultiplayerGame() {
            SessionData.session_data.gameplay_main ? (SessionData.session_data.gameplay_main(), SessionData.session_data.end_ball_movement(), SessionData.session_data.end_cpu_paddle_movement()) : undefined;
            SessionData.game_data.score_left = 0;
            SessionData.game_data.score_right = 0;
            SessionData.game_data.round_started = false;
            SessionData.game_data.start_direction = 1;
            HTMLPage.clearAllChildren(HTMLPage.svg);
            document.getElementById("game").style.display = "block";
            document.getElementById("start").style.display = "none";
            let pongTable = new PongTable(HTMLPage.svg);
            let socket = io();
            let o = Observable
                .fromEvent(document, "mousemove")
                .map(({ clientY }) => ({ y: clientY }))
                .map(({ y }) => ({ y: y - HTMLPage.svg.getBoundingClientRect().top }))
                .filter(({ y }) => y <= (Number(HTMLPage.svg.getAttribute("height"))) - Number(SessionData.session_data.current_paddle.attr("height")) - Settings.settings.padding && y >= Settings.settings.padding)
                .map((y) => ({ gameid: this.GAMEID, y: y.y, socket: this.SOCKETID }))
                .subscribe(s => (socket.emit('movement', s)));
            const _this = this;
            socket.on('player_movement', function (res) {
                _this.updatePaddles(res, pongTable);
            });
            o = Observable
                .fromEvent(HTMLPage.svg, "mousemove")
                .map(({ clientX, clientY }) => ({ x: clientX, y: clientY })).subscribe(_ => HTMLPage.svg.style.cursor = "none");
            if (this.SOCKETID === this.USERS[0]) {
                Observable.interval(Settings.settings.game_speed)
                    .subscribe(s => socket.emit('ball', { x: SessionData.session_data.current_ball.getBall().attr("cx"), y: SessionData.session_data.current_ball.getBall().attr("cy"), player_one: this.USERS[0], socket: this.SOCKETID }));
            }
            if (this.SOCKETID === this.USERS[1]) {
                socket.on('ball_move', function (ball) {
                    SessionData.session_data.current_ball.getBall().attr("cx", ball.x);
                    SessionData.session_data.current_ball.getBall().attr("cy", ball.y);
                });
            }
            this.host_gameplay();
        }
        updateLobbyTable(res, socket, trying_count) {
            document.getElementById("player_wait_banner").textContent = document.getElementById("player_wait_banner").textContent + ".";
            trying_count++;
            if (trying_count > 100) {
                socket.emit("stop_searching_for_players");
                alert("Timed Out. Please try again.");
                Multiplayer.switchToSP();
            }
            if (Object.keys(res).length === 2) {
                let table_div = document.getElementById("player_table");
                table_div.removeChild(table_div.childNodes[0]);
                let table = document.createElement("table"), tr = document.createElement("tr"), td_0 = document.createElement("td"), td_1 = document.createElement("td"), td_2 = document.createElement("td"), text_0 = document.createTextNode("Player Side"), text_1 = document.createTextNode("Socket ID"), text_2 = document.createTextNode("Ready");
                td_0.appendChild(text_0);
                td_1.appendChild(text_1);
                td_2.appendChild(text_2);
                tr.appendChild(td_0);
                tr.appendChild(td_1);
                tr.appendChild(td_2);
                table.appendChild(tr);
                let count = 0;
                for (const [key, value] of Object.entries(res)) {
                    this.USERS.push(key);
                    let tr = document.createElement("tr"), td_0 = document.createElement("td"), td_1 = document.createElement("td"), td_2 = document.createElement("td"), side = document.createTextNode((count === 0) ? "Left Side" : "Right Side"), text_1 = document.createTextNode(key), tick = document.createElement("img");
                    tick.setAttribute("height", "80px");
                    tick.setAttribute("weight", "1000px");
                    tick.setAttribute("src", "img/tick.png");
                    td_0.appendChild(side);
                    td_1.appendChild(text_1);
                    td_2.appendChild(tick);
                    tr.appendChild(td_0);
                    tr.appendChild(td_1);
                    tr.appendChild(td_2);
                    table.appendChild(tr);
                    count++;
                }
                table_div.appendChild(table);
                document.getElementById("player_wait_banner").style.display = "block";
                document.getElementById("player_wait_banner").textContent = "Both Players Connected. Host click on the table to start serving.";
                this.startMultiplayerGame();
                if (!socket.sentMydata) {
                    socket.emit("stop_searching_for_players");
                    socket.sentMydata = true;
                }
            }
        }
        updatePaddles(res, pongTable) {
            let left_paddle = SessionData.session_data.current_paddle;
            left_paddle.attr("y", res[this.GAMEID][this.USERS[0]]);
            let right_paddle = SessionData.session_data.opponent_paddle;
            right_paddle.attr("y", res[this.GAMEID][this.USERS[1]]);
            pongTable.paddle_movement(left_paddle)(res[this.GAMEID][this.USERS[0]]);
            pongTable.paddle_movement(right_paddle)(res[this.GAMEID][this.USERS[1]]);
        }
        updatePlayerHost(res, allocated) {
            if (res.code == 200) {
                allocated[0] = true;
                this.GAMEID = res.gameid;
                this.SOCKETID = res.socket_id;
                this.PLAYERID = res.player_id;
                document.getElementById("gameid").textContent = "Game ID : " + res.gameid;
                document.getElementById("player_wait_banner").style.display = "block";
            }
            else if (res.code == 404) {
                if (allocated[0] == false) {
                    Multiplayer.switchToSP();
                    alert(res.message);
                }
            }
        }
        updatePlayerClient(res) {
            console.log(res);
            if (res.code === 200) {
                this.GAMEID = res.gameid;
                this.SOCKETID = res.socket_id;
                this.PLAYERID = res.player_id;
                this.createLobby(res.gameid);
                document.getElementById("gameid").textContent = "Game ID : " + res.gameid;
            }
            else {
                alert(res.message);
            }
        }
    }
    Multiplayer.MULTIPLAYER_STATUS = false;
    Multiplayer.switchToSP = () => {
        document.getElementById("lobby").style.display = "none";
        document.getElementById("game").style.display = "block";
        document.getElementById("options").style.display = "block";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("multiplayer").style.display = "block";
    };
    const main = () => {
        let game = new Gameplay(), html = new HTMLPage(game), multiplayer = new Multiplayer(html);
    };
    main();
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
        io().emit("ff", "dd");
    };
//# sourceMappingURL=pong.js.map