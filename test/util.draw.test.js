'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var expect = chai.expect;

describe('util/draw.js test suite', function() {
  var sut;
  var module;
  var shellWidth;
  var fakeColors;
  var fakeWrite;


  beforeEach(function(done) {
    fakeWrite = sinon.spy();
    fakeColors = {
      'pass' : 'pass',
      'fail' : 'fail',
      'skip' : 'skip'
    };

    shellWidth = 100;

    module = rewire('../lib/util/draw');

    sut = module.getInstance(shellWidth);

    module.__set__('write', fakeWrite);

    done();
  });

  afterEach(function(done) {
    sut = null;
    module = null;
    shellWidth = null;
    fakeColors = null;
    fakeWrite = null;
    done();
  });

  describe('instantiation tests', function() {
    it('should set the defaults values appropriately', function() {
      var maxWidth = sut.trajectoryWidthMax;
      expect(sut.numberOfLines).to.eq(4);
      expect(sut.nyanCatWidth).to.eq(11);
      expect(sut.scoreboardWidth).to.eq(5);
      expect(sut.tick).to.eq(0);
      expect(sut.trajectories).to.eql([[], [], [], []]);
      expect(maxWidth).to.eq((shellWidth * 0.75 | 0) - sut.nyanCatWidth);
    });
  });

  /**
   * appendRainbow() tests
   */

  describe('appendRainbow method tests', function() {
    var rainbowifierFake;

    beforeEach(function(done) {
      rainbowifierFake = {
        'rainbowify' : sinon.stub()
      };

      rainbowifierFake.rainbowify.withArgs('-').returns('-');
      rainbowifierFake.rainbowify.withArgs('_').returns('_');
      done();
    });

    afterEach(function(done) {
      rainbowifierFake = null;
      done();
    });

    it('should manipulate the trajectories data appropriately', function() {
      sut.appendRainbow(rainbowifierFake);

      expect(rainbowifierFake.rainbowify.calledOnce).to.be.true;
      expect(rainbowifierFake.rainbowify.calledWithExactly('-')).to.be.true;
      expect(sut.trajectories.length).to.eq(4);
      expect(sut.trajectories[0].length).to.eq(1);
      expect(sut.trajectories[1].length).to.eq(1);
      expect(sut.trajectories[2].length).to.eq(1);
      expect(sut.trajectories[3].length).to.eq(1);
      expect(sut.trajectories[0][0]).to.eq('-');
      expect(sut.trajectories[1][0]).to.eq('-');
      expect(sut.trajectories[2][0]).to.eq('-');
      expect(sut.trajectories[3][0]).to.eq('-');

      sut.tick = true;
      sut.appendRainbow(rainbowifierFake);

      expect(rainbowifierFake.rainbowify.calledWithExactly('-')).to.be.true;
      expect(sut.trajectories.length).to.eq(4);
      expect(sut.trajectories[0].length).to.eq(2);
      expect(sut.trajectories[1].length).to.eq(2);
      expect(sut.trajectories[2].length).to.eq(2);
      expect(sut.trajectories[3].length).to.eq(2);
      expect(sut.trajectories[0][1]).to.eq('_');
      expect(sut.trajectories[1][1]).to.eq('_');
      expect(sut.trajectories[2][1]).to.eq('_');
      expect(sut.trajectories[3][1]).to.eq('_');
    });

    it('should not allow trajectories sub-arrays length to exceed trajectoryWidthMax', function() {
      var i;
      sut.trajectoryWidthMax = 1;

      for(i = 0; i < 10; i++) {
        sut.appendRainbow(rainbowifierFake);
      }

      expect(sut.trajectories[0].length).to.eq(1);
      expect(sut.trajectories[1].length).to.eq(1);
      expect(sut.trajectories[2].length).to.eq(1);
      expect(sut.trajectories[3].length).to.eq(1);

      sut.trajectoryWidthMax = 2;

      for(i = 0; i < 10; i++) {
        sut.appendRainbow(rainbowifierFake);
      }

      expect(sut.trajectories[0].length).to.eq(2);
      expect(sut.trajectories[1].length).to.eq(2);
      expect(sut.trajectories[2].length).to.eq(2);
      expect(sut.trajectories[3].length).to.eq(2);
    });
  });

  /**
   * drawScoreboard() tests
   */

  describe('drawScoreboard method tests', function() {
    var colors;
    var stats;
    var numOfLns;

    beforeEach(function(done) {
      stats = {
        'success': 33,
        'failed': 66,
        'skipped': 99
      };

      numOfLns = 111;

      sut.cursorUp = sinon.spy();
      sut.numberOfLines = numOfLns;

      sut.drawScoreboard(stats);
      done();
    });

    afterEach(function(done) {
      colors = null;
      stats = null;
      numOfLns = null;
      done();
    });

    it('should call the write method with the correct values', function() {
      expect(fakeWrite.callCount).to.eq(10);

      var pass = '\u001b[' + sut.colors.pass + 'm' + stats.success + '\u001b[0m';
      var fail = '\u001b[' + sut.colors.fail + 'm' + stats.failed + '\u001b[0m';
      var skip = '\u001b[' + sut.colors.skip + 'm' + stats.skipped + '\u001b[0m';

      expect(fakeWrite.getCall(0).args[0]).to.eq(' ');
      expect(fakeWrite.getCall(1).args[0]).to.eq(pass);
      expect(fakeWrite.getCall(2).args[0]).to.eq('\n');

      expect(fakeWrite.getCall(3).args[0]).to.eq(' ');
      expect(fakeWrite.getCall(4).args[0]).to.eq(fail);
      expect(fakeWrite.getCall(5).args[0]).to.eq('\n');

      expect(fakeWrite.getCall(6).args[0]).to.eq(' ');
      expect(fakeWrite.getCall(7).args[0]).to.eq(skip);
      expect(fakeWrite.getCall(8).args[0]).to.eq('\n');

      expect(fakeWrite.getCall(9).args[0]).to.eq('\n');
    });

    it('should call cursorUp with numberOfLines', function() {
      expect(sut.cursorUp.calledOnce).to.be.true;
      expect(sut.cursorUp.calledWithExactly(numOfLns)).to.be.true;
    });
  });

  /**
   * drawRainbow() tests
   */

  describe('drawRainbow method tests', function() {
    it('should call write and cursorUp as expected', function() {
      sut.trajectories = [['hel'], ['lo!']];
      sut.cursorUp = sinon.spy();
      sut.drawRainbow();

      expect(fakeWrite.callCount).to.eq(6);
      expect(sut.cursorUp.calledOnce).to.be.true;

      var resultOne = '\u001b[' + sut.scoreboardWidth + 'C';
      var resultTwo = sut.trajectories[0].join('');
      var resultThree = '\n';

      expect(fakeWrite.firstCall.calledWithExactly(resultOne)).to.be.true;
      expect(fakeWrite.secondCall.calledWithExactly(resultTwo)).to.be.true;
      expect(fakeWrite.thirdCall.calledWithExactly(resultThree)).to.be.true;
    });
  });

  /**
   * drawNyanCat() tests
   */

  describe('drawNyanCat method tests', function() {
    it('should call the write and cursorUp as expected', function() {
      var write = fakeWrite;
      var face = 'face';
      var stats = 'stats';
      var color = '\u001b[' + (sut.scoreboardWidth + sut.trajectories[0].length) + 'C';

      sut.face = sinon.stub();
      sut.face.withArgs(stats).returns(face);
      sut.cursorUp = sinon.spy();
      sut.drawNyanCat(stats);

      expect(write.callCount).to.eq(12);
      expect(sut.cursorUp.calledOnce).to.be.true;

      expect(write.getCall(0).args[0]).to.eq(color);
      expect(write.getCall(1).args[0]).to.eq('_,------,');
      expect(write.getCall(2).args[0]).to.eq('\n');

      expect(write.getCall(3).args[0]).to.eq(color);
      expect(write.getCall(4).args[0]).to.eq('_|   /\\_/\\ ');
      expect(write.getCall(5).args[0]).to.eq('\n');

      expect(write.getCall(6).args[0]).to.eq(color);
      expect(write.getCall(7).args[0]).to.eq('^|__' + face + ' ');
      expect(write.getCall(8).args[0]).to.eq('\n');

      expect(write.getCall(9).args[0]).to.eq(color);
      expect(write.getCall(10).args[0]).to.eq('  ""  "" ');
      expect(write.getCall(11).args[0]).to.eq('\n');
    });
  });

  /**
   * face() tests
   */

  describe('face method tests', function() {
    it('should return as exected if stats.failed is true', function() {
      var face = sut.face({failed: true});
      expect(face).to.eq('( x .x)');
    });

    it('should return as exected if stats.skipped is true', function() {
      var face = sut.face({skipped: true});
      expect(face).to.eq('( o .o)');
    });

    it('should return as exected if stats.success is true', function() {
      var face = sut.face({success: true});
      expect(face).to.eq('( ^ .^)');
    });

    it('should return as exected if none of the above are true', function() {
      var face = sut.face({});
      expect(face).to.eq('( - .-)');
    });
  });

  /**
   * cursorUp() tests
   */

  describe('cursorUp method tests', function() {
    it('should call write with the expected values', function() {
      var arg = 'blah';
      var clcFake = { up: sinon.stub() };
      module.__set__('clc', clcFake);

      clcFake.up.returns('up');

      sut.cursorUp(arg);

      expect(fakeWrite.calledOnce).to.be.true;
      expect(fakeWrite.calledWithExactly('up')).to.be.true;
    });
  });
});