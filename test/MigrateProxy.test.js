const { BN, constants, ether, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');
const BadToken = artifacts.require('BadToken');


contract('Migrate', function ([_, user1, user2, deployer, owner, admin, tokenWallet, tokenContract]) {
    before(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.target = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: deployer });
    });

    const userID1 = new BN('11');
    const userID2 = new BN('12');
    const rank = new BN('1');
    const tokenID0 = new BN('0');
    const tokenID1 = new BN('0');
    const tokenID2 = new BN('11');
    const tokenID3 = new BN('23');
    const tokenIDBad = new BN('66');
    const depositValue = ether('0.1');
    const migration1 = '0x00000000000b471c92f915ae766c4964eedc300e5b8ff41e443c';
    const sig1 = '0x87a72fa86c8490370b4498d9afe1d75e876174ccf8018a14fd9da87756fb8c8a15ddf6a61e62aaa16e0be4328850414f188ae687755cad262cd971de571439b801';
    const migration2 = '0x0017000b00000000000c471c92f915ae766c4964eedc300e5b8ff41e443c';
    const sig2 = '0xd3cf89a5a2de798c0d5dd21beddb67d16663ca0de2e59233f6fbc9948401332275ec1c777383273eb634c579f4235161d721658fc7bc209f88ff392090622e3401';
    const migration3 = '0x000b0000000c471c92f915ae766c4964eedc300e5b8ff41e443c';
    const sig3 = '0xc94a77913f83414e49a1b82cf594b44f402a13edb2d1e1d44b998d6eacc72d925a6742d67a2745a79ede922894fc0d3cf518757b46909a819a1074c07c2084c301';
    const migration4 = '0x00420000000c471c92f915ae766c4964eedc300e5b8ff41e443c';
    const sig4 = '0x317db6703e1dea34b9730e9a79df63710e96573403c8c2588f21b6cdbdaa15ad2769963a7bae34d177a251f0ad4ce490b40a322bba76efb3cfde89f216321f4b00';

    beforeEach(async function () {
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
        await this.dinngo.activateAdmin(admin, { from: owner });
        await this.dinngo.deactivateAdmin(owner, { from: owner });
        await this.dinngo.setUser(userID1, user1, rank);
        await this.dinngo.setUser(userID2, user2, rank);
        this.token1 = await SimpleToken.new({ from: user2 });
        this.token2 = await SimpleToken.new({ from: user2 });
        this.tokenBad = await BadToken.new({ from: user2 });
        await this.dinngo.setToken(tokenID0, ZERO_ADDRESS, rank);
        await this.dinngo.setToken(tokenID2, this.token1.address, rank);
        await this.dinngo.setToken(tokenID3, this.token2.address, rank);
        await this.dinngo.setToken(tokenIDBad, this.tokenBad.address, rank);
    });

    describe('single ether', function () {
        let etherDinngo;
        let etherTarget;
        let etherOld;
        let etherNew;

        beforeEach(async function () {
            await this.dinngo.deposit({ value: depositValue, from: user1 });
            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user1);
            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
        });

        it('when normal', async function () {
            expect(etherDinngo).to.be.bignumber.eq(depositValue);
            expect(etherTarget).to.be.bignumber.eq('0');
            expect(etherOld).to.eq(depositValue.toString());
            expect(etherNew).to.eq('0');
            const receipt = await this.dinngo.migrateByAdmin(migration1, sig1, { from: admin });
            console.log(receipt.receipt.gasUsed);
            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user1);
            expect(etherDinngo).to.be.bignumber.eq('0');
            expect(etherTarget).to.be.bignumber.eq(depositValue);
            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
            expect(etherOld).to.eq('0');
            expect(etherNew).to.eq(depositValue.toString());
        });

        it('when sent by owner', async function () {
            await expectRevert(
                this.dinngo.migrateByAdmin(migration1, sig1, { from: owner }),
                '403.1'
            );
        });

        it('when sent by non-admin', async function () {
            await expectRevert(
                this.dinngo.migrateByAdmin(migration1, sig1),
                '403.1'
            );
        });

        it('when user is removed', async function () {
            await this.dinngo.removeUser(user1, { from: admin });
            await expectRevert(
                this.dinngo.migrateByAdmin(migration1, sig1, { from: admin }),
                '400.4'
            );
        });

        it('when migrating zero amount', async function () {
            await this.dinngo.setUserBalance(user1, ZERO_ADDRESS, ether('0'));
            await expectRevert(
                this.dinngo.migrateByAdmin(migration1, sig1, { from: admin }),
                '400.5'
            );
        });
    });

    describe('single token', function () {
        let tokenDinngo;
        let tokenTarget;
        let tokenOld;
        let tokenNew;

        beforeEach(async function () {
            await this.token1.approve(this.dinngo.address, depositValue, { from: user2 });
            await this.dinngo.depositToken(this.token1.address, depositValue, { from: user2 });
            tokenDinngo = await this.dinngo.balances.call(this.token1.address, user2);
            tokenTarget = await this.target.balances.call(this.token1.address, user2);
            tokenOld = await this.token1.balanceOf.call(this.dinngo.address);
            tokenNew = await this.token1.balanceOf.call(this.target.address);
        });

        it('when normal', async function () {
            expect(tokenDinngo).to.be.bignumber.eq(depositValue);
            expect(tokenTarget).to.be.bignumber.eq('0');
            expect(tokenOld).to.be.bignumber.eq(depositValue);
            expect(tokenNew).to.be.bignumber.eq(new BN('0'));
            const receipt = await this.dinngo.migrateByAdmin(migration3, sig3, { from: admin });
            console.log(receipt.receipt.gasUsed);
            tokenDinngo = await this.dinngo.balances.call(this.token1.address, user2);
            tokenTarget = await this.target.balances.call(this.token1.address, user2);
            expect(tokenDinngo).to.be.bignumber.eq(new BN('0'));
            expect(tokenTarget).to.be.bignumber.eq(depositValue);
            tokenOld = await this.token1.balanceOf.call(this.dinngo.address);
            tokenNew = await this.token1.balanceOf.call(this.target.address);
            expect(tokenOld).to.be.bignumber.eq(new BN('0'));
            expect(tokenNew).to.be.bignumber.eq(depositValue);
        });

        it('when sent by owner', async function () {
            await expectRevert(
                this.dinngo.migrateByAdmin(migration3, sig3, { from: owner }),
                '403.1'
            );
        });

        it('when sent by non-admin', async function () {
            await expectRevert(
                this.dinngo.migrateByAdmin(migration3, sig3),
                '403.1'
            );
        });

        it('when user is removed', async function () {
            await this.dinngo.removeUser(user2, { from: admin });
            await expectRevert(
                this.dinngo.migrateByAdmin(migration3, sig3, { from: admin }),
                '400.4'
            );
        });

        it('when migrating zero amount', async function () {
            await this.dinngo.setUserBalance(user1, this.token1.address, ether('0'));
            await expectRevert(
                this.dinngo.migrateByAdmin(migration1, sig1, { from: admin }),
                '400.5'
            );
        });
    });

    describe('single bad token', function () {
        let tokenDinngo;
        let tokenTarget;
        let tokenOld;
        let tokenNew;

        beforeEach(async function () {
            await this.tokenBad.approve(this.dinngo.address, depositValue, { from: user2 });
            await this.dinngo.depositToken(this.tokenBad.address, depositValue, { from: user2 });
            tokenDinngo = await this.dinngo.balances.call(this.tokenBad.address, user2);
            tokenTarget = await this.target.balances.call(this.tokenBad.address, user2);
            tokenOld = await this.tokenBad.balanceOf.call(this.dinngo.address);
            tokenNew = await this.tokenBad.balanceOf.call(this.target.address);
        });

        it('when normal', async function () {
            expect(tokenDinngo).to.be.bignumber.eq(depositValue);
            expect(tokenTarget).to.be.bignumber.eq('0');
            expect(tokenOld).to.be.bignumber.eq(depositValue);
            expect(tokenNew).to.be.bignumber.eq(new BN('0'));
            const receipt = await this.dinngo.migrateByAdmin(migration4, sig4, { from: admin });
            console.log(receipt.receipt.gasUsed);
            tokenDinngo = await this.dinngo.balances.call(this.tokenBad.address, user2);
            tokenTarget = await this.target.balances.call(this.tokenBad.address, user2);
            expect(tokenDinngo).to.be.bignumber.eq(new BN('0'));
            expect(tokenTarget).to.be.bignumber.eq(depositValue);
            tokenOld = await this.tokenBad.balanceOf.call(this.dinngo.address);
            tokenNew = await this.tokenBad.balanceOf.call(this.target.address);
            expect(tokenOld).to.be.bignumber.eq(new BN('0'));
            expect(tokenNew).to.be.bignumber.eq(depositValue);
        });

        it('when sent by owner', async function () {
            await expectRevert(
                this.dinngo.migrateByAdmin(migration4, sig4, { from: owner }),
                '403.1'
            );
        });

        it('when sent by non-admin', async function () {
            await expectRevert(
                this.dinngo.migrateByAdmin(migration4, sig4),
                '403.1'
            );
        });

        it('when user is removed', async function () {
            await this.dinngo.removeUser(user2, { from: admin });
            await expectRevert(
                this.dinngo.migrateByAdmin(migration4, sig4, { from: admin }),
                '400.4'
            );
        });

        it('when migrating zero amount', async function () {
            await this.dinngo.setUserBalance(user1, this.tokenBad.address, ether('0'));
            await expectRevert(
                this.dinngo.migrateByAdmin(migration1, sig1, { from: admin }),
                '400.5'
            );
        });
    });

    describe('multiple tokens', function () {
        let etherDinngo;
        let etherTarget;
        let etherOld;
        let etherNew;
        let token1Dinngo;
        let token1Target;
        let token1Old;
        let token1New;
        let token2Dinngo;
        let token2Target;
        let token2Old;
        let token2New;

        beforeEach(async function () {
            await this.dinngo.deposit({ value: depositValue, from: user2 });
            await this.token1.approve(this.dinngo.address, depositValue, { from: user2 });
            await this.dinngo.depositToken(this.token1.address, depositValue, { from: user2 });
            await this.token2.approve(this.dinngo.address, depositValue, { from: user2 });
            await this.dinngo.depositToken(this.token2.address, depositValue, { from: user2 });
            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user2);
            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
            token1Dinngo = await this.dinngo.balances.call(this.token1.address, user2);
            token1Target = await this.target.balances.call(this.token1.address, user2);
            token1Old = await this.token1.balanceOf.call(this.dinngo.address);
            token1New = await this.token1.balanceOf.call(this.target.address);
            token2Dinngo = await this.dinngo.balances.call(this.token2.address, user2);
            token2Target = await this.target.balances.call(this.token2.address, user2);
            token2Old = await this.token2.balanceOf.call(this.dinngo.address);
            token2New = await this.token2.balanceOf.call(this.target.address);
        });

        it('when normal', async function () {
            expect(etherDinngo).to.be.bignumber.eq(depositValue);
            expect(etherTarget).to.be.bignumber.eq('0');
            expect(etherOld).to.eq(depositValue.toString());
            expect(etherNew).to.eq(depositValue.toString());
            expect(token1Dinngo).to.be.bignumber.eq(depositValue);
            expect(token1Target).to.be.bignumber.eq('0');
            expect(token1Old).to.be.bignumber.eq(depositValue);
            expect(token1New).to.be.bignumber.eq('0');
            expect(token2Dinngo).to.be.bignumber.eq(depositValue);
            expect(token2Target).to.be.bignumber.eq('0');
            expect(token2Old).to.be.bignumber.eq(depositValue);
            expect(token2New).to.be.bignumber.eq('0');

            await this.dinngo.setUserBalance(user2, tokenContract, depositValue);
            const receipt = await this.dinngo.migrateByAdmin(migration2, sig2, { from: admin });
            console.log(receipt.receipt.gasUsed);

            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user2);
            token1Dinngo = await this.dinngo.balances.call(this.token1.address, user2);
            token1Target = await this.target.balances.call(this.token1.address, user2);
            token2Dinngo = await this.dinngo.balances.call(this.token2.address, user2);
            token2Target = await this.target.balances.call(this.token2.address, user2);
            expect(etherDinngo).to.be.bignumber.eq('0');
            expect(etherTarget).to.be.bignumber.eq(depositValue);
            expect(token1Dinngo).to.be.bignumber.eq('0');
            expect(token1Target).to.be.bignumber.eq(depositValue);
            expect(token2Dinngo).to.be.bignumber.eq('0');
            expect(token2Target).to.be.bignumber.eq(depositValue);

            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
            token1Old = await this.token1.balanceOf.call(this.dinngo.address);
            token1New = await this.token1.balanceOf.call(this.target.address);
            token2Old = await this.token2.balanceOf.call(this.dinngo.address);
            token2New = await this.token2.balanceOf.call(this.target.address);

            expect(etherOld).to.eq('0');
            expect(etherNew).to.eq((depositValue.add(depositValue)).toString());
            expect(token1Old).to.be.bignumber.eq('0');
            expect(token1New).to.be.bignumber.eq(depositValue);
            expect(token2Old).to.be.bignumber.eq('0');
            expect(token2New).to.be.bignumber.eq(depositValue);
        });
    });
});
