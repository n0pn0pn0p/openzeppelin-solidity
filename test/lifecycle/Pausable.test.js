const { assertRevert } = require('../helpers/assertRevert');
const PausableMock = artifacts.require('PausableMock');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Pausable', function () {
  beforeEach(async function () {
    this.Pausable = await PausableMock.new();
  });

  it('can perform normal process in non-pause', async function () {
    const count0 = await this.Pausable.count();
    count0.should.be.bignumber.equal(0);

    await this.Pausable.normalProcess();
    const count1 = await this.Pausable.count();
    count1.should.be.bignumber.equal(1);
  });

  it('can not perform normal process in pause', async function () {
    await this.Pausable.pause();
    const count0 = await this.Pausable.count();
    count0.should.be.bignumber.equal(0);

    await assertRevert(this.Pausable.normalProcess());
    const count1 = await this.Pausable.count();
    count1.should.be.bignumber.equal(0);
  });

  it('can not take drastic measure in non-pause', async function () {
    await assertRevert(this.Pausable.drasticMeasure());
    const drasticMeasureTaken = await this.Pausable.drasticMeasureTaken();

    drasticMeasureTaken.should.be.false;
  });

  it('can take a drastic measure in a pause', async function () {
    await this.Pausable.pause();
    await this.Pausable.drasticMeasure();
    const drasticMeasureTaken = await this.Pausable.drasticMeasureTaken();

    drasticMeasureTaken.should.be.true;
  });

  it('should resume allowing normal process after pause is over', async function () {
    await this.Pausable.pause();
    await this.Pausable.unpause();
    await this.Pausable.normalProcess();
    const count0 = await this.Pausable.count();

    count0.should.be.bignumber.equal(1);
  });

  it('should prevent drastic measure after pause is over', async function () {
    await this.Pausable.pause();
    await this.Pausable.unpause();

    await assertRevert(this.Pausable.drasticMeasure());

    const drasticMeasureTaken = await this.Pausable.drasticMeasureTaken();
    drasticMeasureTaken.should.be.false;
  });
});
