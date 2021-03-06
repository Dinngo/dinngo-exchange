const { BN, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');

contract('Settle', function ([_, user1, user2, user3, user4, user5, owner, dinngoWallet, DGO, token]) {
    const admin = token;
    const balance = ether('1000');
    const id1 = new BN('11');
    const id2 = new BN('12');
    const id3 = new BN('13');
    const id4 = new BN('14');
    const id5 = new BN('15');
    const tokenId = new BN('11');
    const rank = new BN('1');
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(dinngoWallet, DGO, this.dinngoImpl.address, { from: owner });
        await this.dinngo.activateAdmin(admin, { from: owner });
        await this.dinngo.deactivateAdmin(owner, { from: owner });
        await this.dinngo.setUser(id1, user1, rank);
        await this.dinngo.setUser(id2, user2, rank);
        await this.dinngo.setUser(id3, user3, rank);
        await this.dinngo.setUser(id4, user4, rank);
        await this.dinngo.setUser(id5, user5, rank);
        await this.dinngo.setToken(tokenId, token, rank);
        await this.dinngo.setUserBalance(user1, token, balance);
        await this.dinngo.setUserBalance(user1, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user1, DGO, balance);
        await this.dinngo.setUserBalance(user2, token, balance);
        await this.dinngo.setUserBalance(user2, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user2, DGO, balance);
        await this.dinngo.setUserBalance(user3, token, balance);
        await this.dinngo.setUserBalance(user3, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user3, DGO, balance);
        await this.dinngo.setUserBalance(user4, token, balance);
        await this.dinngo.setUserBalance(user4, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user4, DGO, balance);
        await this.dinngo.setUserBalance(user5, token, balance);
        await this.dinngo.setUserBalance(user5, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user5, DGO, balance);
        await this.dinngo.setUserBalance(ZERO_ADDRESS, token, balance);
        await this.dinngo.setUserBalance(ZERO_ADDRESS, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(ZERO_ADDRESS, DGO, balance);
    });

    describe('settle for buying taker', function () {
        const orders1_2 =
            '0x00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c';
        const sigs1_2 =
            '0x7ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd0445206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e8013620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003215cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b01';
        const orders1_2_3 =
            '0x00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c00000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d';
        const sigs1_2_3 =
            '0x7ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd0445206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e8013620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003215cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b01fbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7a01'
        const orders1_2_3_4 =
            '0x00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c00000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000429d069189e000000000004020000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e';
        const sigs1_2_3_4 =
            '0x7ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd0445206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e8013620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003215cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b01fbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7a01bd2a4416d26d13c8168131b1299a5cb1dd5258134517eb5af365e734aaf8667a279e5fef352791669c62e035c87dd06afe5b659f7e1b1753777d0b5db4d1dfef00'
        const orders1_2_3_4_5 =
            '0x00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c00000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000429d069189e000000000004020000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000004563918244f400000000000500000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000f';
        const sigs1_2_3_4_5 =
            '0x7ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd0445206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e8013620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003215cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b01fbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7a01bd2a4416d26d13c8168131b1299a5cb1dd5258134517eb5af365e734aaf8667a279e5fef352791669c62e035c87dd06afe5b659f7e1b1753777d0b5db4d1dfef003e2e99c0dbb42415dd847f4cdaa8e56797437f203dc6e7269af85fa7b06a4f95791539c4314f144582f5e76069240666a0f20ca00719df0c01d951bcec855a3f00';

        const hash1 = '0xf1a59881b0097adaa34d7570a1f79dd02c1aec89c62124dc76fcdd11f1fcdf64';
        const hash2 = '0x013b99b07bf66d7c6e7817bc34f162199c4534424719964586f9a9ce9078cf5d';
        const hash3 = '0xd799d12eb222a08208b511e405a73b92cf99d77a76f533d30e3118a605c495a2';
        const hash4 = '0x176b8bd141d683e05d7c22b77afcd7b0632a62b8be441623fb70fa0eec614344';
        const hash5 = '0x1c0bd84677b1bccf6c977928151b7158daab9d401d5fc4dacdada0572a5d1008';

        const tokenBase = token;
        const tokenQuote = ZERO_ADDRESS;

        const amountBase1 = ether('100');
        const amountQuote1 = ether('1');
        const tradeFee1 = ether('1');
        const gasFee1 = ether('0.001');
        const isBuy1 = true;
        const isFeeMain1 = true;

        const amountBase2 = ether('10');
        const amountQuote2 = ether('0.1');
        const tradeFee2 = ether('0.1');
        const gasFee2 = ether('0.001');
        const isBuy2 = false;
        const isFeeMain2 = true;

        const amountBase3 = ether('20');
        const amountQuote3 = ether('0.2');
        const tradeFee3 = ether('0.2');
        const gasFee3 = ether('0.001');
        const isBuy3 = false;
        const isFeeMain3 = true;

        const amountBase4 = ether('30');
        const amountQuote4 = ether('0.3');
        const tradeFee4 = ether('0.3');
        const gasFee4 = ether('0.001');
        const isBuy4 = false;
        const isFeeMain4 = true;

        const amountBase5 = ether('10');
        const amountQuote5 = ether('0.1');
        const tradeFee5 = ether('5');
        const gasFee5 = ether('1');
        const isBuy5 = false;
        const isFeeMain5 = false;

        it('Normal', async function () {
            const { logs } = await this.dinngo.settle(orders1_2, sigs1_2, { from: admin });
            inLogs(logs, 'Trade',
                {
                    user: user2,
                    isBuy: false,
                    tokenBase: tokenBase,
                    amountBase: amountBase2,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote2,
                    tokenFee: tokenQuote,
                    amountFee: tradeFee2.add(gasFee2)
                }
            );

            inLogs(logs, 'Trade',
                {
                    user: user1,
                    isBuy: true,
                    tokenBase: tokenBase,
                    amountBase: amountBase2,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote2,
                    tokenFee: tokenBase,
                    amountFee: tradeFee1.mul(amountBase2).div(amountBase1).add(gasFee1)
                }
            )

            const user1Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            const user1DGO = await this.dinngo.balances.call(DGO, user1);
            const user1Token = await this.dinngo.balances.call(token, user1);
            const user2Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            const user2DGO = await this.dinngo.balances.call(DGO, user2);
            const user2Token = await this.dinngo.balances.call(token, user2);
            const walletEther = await this.dinngo.getWalletBalance.call(ZERO_ADDRESS);
            const walletDGO = await this.dinngo.getWalletBalance.call(DGO);
            const walletToken = await this.dinngo.getWalletBalance.call(token);
            expect(user1Ether).to.be.bignumber.eq(
                balance.sub(
                    amountQuote2
                )
            );
            expect(user1DGO).to.be.bignumber.eq(balance);
            expect(user1Token).to.be.bignumber.eq(
                balance.add(
                    amountBase2
                ).sub(
                    tradeFee1.mul(amountBase2).div(amountBase1)
                ).sub(
                    gasFee1
                )
            );
            expect(user2Ether).to.be.bignumber.eq(
                balance.add(
                    amountQuote2
                ).sub(
                    tradeFee2
                ).sub(
                    gasFee2
                )
            );
            expect(user2DGO).to.be.bignumber.eq(balance);
            expect(user2Token).to.be.bignumber.eq(
                balance.sub(
                    amountBase2
                )
            );
            expect(walletEther).to.be.bignumber.eq(
                balance.add(
                    tradeFee2
                ).add(
                    gasFee2
                )
            );
            expect(walletDGO).to.be.bignumber.eq(balance);
            expect(walletToken).to.be.bignumber.eq(
                balance.add(
                    tradeFee1.mul(amountQuote2).div(amountQuote1)
                ).add(
                    gasFee1
                )
            );
            const amount1 = await this.dinngo.orderFills.call(hash1);
            const amount2 = await this.dinngo.orderFills.call(hash2);
            expect(amount1).to.be.bignumber.eq(amountBase2);
            expect(amount2).to.be.bignumber.eq(amountBase2);
        });

        it('Normal count gas 1-1', async function () {
            const receipt = await this.dinngo.settle(orders1_2, sigs1_2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-2', async function () {
            const receipt = await this.dinngo.settle(orders1_2_3, sigs1_2_3, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-3', async function () {
            const receipt = await this.dinngo.settle(orders1_2_3_4, sigs1_2_3_4, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-4', async function () {
            const receipt = await this.dinngo.settle(orders1_2_3_4_5, sigs1_2_3_4_5, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal 1 taker 4 maker', async function () {
            const { logs } = await this.dinngo.settle(orders1_2_3_4_5, sigs1_2_3_4_5, { from: admin });
            const tradeFee = tradeFee1.mul(
                amountBase2.add(amountBase3).add(amountBase4).add(amountBase5)
            ).div(amountBase1);
            inLogs(logs, 'Trade',
                {
                    user: user2,
                    isBuy: false,
                    tokenBase: tokenBase,
                    amountBase: amountBase2,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote2,
                    tokenFee: tokenQuote,
                    amountFee: tradeFee2.add(gasFee2)
                }
            );
            inLogs(logs, 'Trade',
                {
                    user: user3,
                    isBuy: false,
                    tokenBase: tokenBase,
                    amountBase: amountBase3,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote3,
                    tokenFee: tokenQuote,
                    amountFee: tradeFee3.add(gasFee3)
                }
            );
            inLogs(logs, 'Trade',
                {
                    user: user4,
                    isBuy: false,
                    tokenBase: tokenBase,
                    amountBase: amountBase4,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote4,
                    tokenFee: tokenQuote,
                    amountFee: tradeFee4.add(gasFee4)
                }
            );
            inLogs(logs, 'Trade',
                {
                    user: user5,
                    isBuy: false,
                    tokenBase: tokenBase,
                    amountBase: amountBase5,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote5,
                    tokenFee: DGO,
                    amountFee: tradeFee5.add(gasFee5)
                }
            );
            inLogs(logs, 'Trade',
                {
                    user: user1,
                    isBuy: true,
                    tokenBase: tokenBase,
                    amountBase:
                        amountBase2.add(
                            amountBase3
                        ).add(
                            amountBase4
                        ).add(
                            amountBase5
                        ),
                    tokenQuote: tokenQuote,
                    amountQuote:
                        amountQuote2.add(
                            amountQuote3
                        ).add(
                            amountQuote4
                        ).add(
                            amountQuote5
                        ),
                    tokenFee: tokenBase,
                    amountFee: tradeFee.add(gasFee1)
                }
            );

            const user1Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            const user1DGO = await this.dinngo.balances.call(DGO, user1);
            const user1Token = await this.dinngo.balances.call(token, user1);
            const user2Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            const user2DGO = await this.dinngo.balances.call(DGO, user2);
            const user2Token = await this.dinngo.balances.call(token, user2);
            const user3Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user3);
            const user3DGO = await this.dinngo.balances.call(DGO, user3);
            const user3Token = await this.dinngo.balances.call(token, user3);
            const user4Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user4);
            const user4DGO = await this.dinngo.balances.call(DGO, user4);
            const user4Token = await this.dinngo.balances.call(token, user4);
            const user5Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user5);
            const user5DGO = await this.dinngo.balances.call(DGO, user5);
            const user5Token = await this.dinngo.balances.call(token, user5);
            const walletEther = await this.dinngo.getWalletBalance.call(ZERO_ADDRESS);
            const walletDGO = await this.dinngo.getWalletBalance.call(DGO);
            const walletToken = await this.dinngo.getWalletBalance.call(token);
            expect(user1Ether).to.be.bignumber.eq(
                balance.sub(
                    amountQuote2
                ).sub(
                    amountQuote3
                ).sub(
                    amountQuote4
                ).sub(
                    amountQuote5
                )
            );
            expect(user1DGO).to.be.bignumber.eq(balance);
            expect(user1Token).to.be.bignumber.eq(
                balance.add(
                    amountBase2
                ).add(
                    amountBase3
                ).add(
                    amountBase4
                ).add(
                    amountBase5
                ).sub(
                    tradeFee
                ).sub(
                    gasFee1
                )
            );
            expect(user2Ether).to.be.bignumber.eq(
                balance.add(
                    amountQuote2
                ).sub(
                    tradeFee2
                ).sub(
                    gasFee2
                )
            );
            expect(user2DGO).to.be.bignumber.eq(balance);
            expect(user2Token).to.be.bignumber.eq(
                balance.sub(
                    amountBase2
                )
            );
            expect(user3Ether).to.be.bignumber.eq(
                balance.add(
                    amountQuote3
                ).sub(
                    tradeFee3
                ).sub(
                    gasFee3
                )
            );
            expect(user3DGO).to.be.bignumber.eq(balance);
            expect(user3Token).to.be.bignumber.eq(
                balance.sub(
                    amountBase3
                )
            );
            expect(user4Ether).to.be.bignumber.eq(
                balance.add(
                    amountQuote4
                ).sub(
                    tradeFee4
                ).sub(
                    gasFee4
                )
            );
            expect(user4DGO).to.be.bignumber.eq(balance);
            expect(user4Token).to.be.bignumber.eq(
                balance.sub(
                    amountBase4
                )
            );
            expect(user5Ether).to.be.bignumber.eq(balance.add(amountQuote5));
            expect(user5DGO).to.be.bignumber.eq(balance.sub(tradeFee5).sub(gasFee5));
            expect(user5Token).to.be.bignumber.eq(balance.sub(amountBase5));
            expect(walletEther).to.be.bignumber.eq(
                balance.add(
                    tradeFee2
                ).add(
                    gasFee2
                ).add(
                    tradeFee3
                ).add(
                    gasFee3
                ).add(
                    tradeFee4
                ).add(
                    gasFee4
                )
            );
            expect(walletDGO).to.be.bignumber.eq(
                balance.add(
                    tradeFee5
                ).add(
                    gasFee5
                )
            );
            expect(walletToken).to.be.bignumber.eq(
                balance.add(
                    tradeFee
                ).add(
                    gasFee1
                )
            );
            const amount1 = await this.dinngo.orderFills.call(hash1);
            const amount2 = await this.dinngo.orderFills.call(hash2);
            const amount3 = await this.dinngo.orderFills.call(hash3);
            const amount4 = await this.dinngo.orderFills.call(hash4);
            const amount5 = await this.dinngo.orderFills.call(hash5);
            expect(amount1).to.be.bignumber.eq(
                amountBase2.add(amountBase3).add(amountBase4).add(amountBase5)
            );
            expect(amount2).to.be.bignumber.eq(amountBase2);
            expect(amount3).to.be.bignumber.eq(amountBase3);
            expect(amount4).to.be.bignumber.eq(amountBase4);
            expect(amount5).to.be.bignumber.eq(amountBase5);
        });

        it('taker invalid', async function () {
            await this.dinngo.removeUser(user2, { from: admin });
            await expectRevert(
                this.dinngo.settle(orders1_2, sigs1_2, { from: admin }),
                '400.4'
            );
        });

        it('maker invalid', async function () {
            await this.dinngo.removeUser(user1, { from: admin });
            await expectRevert(
                this.dinngo.settle(orders1_2, sigs1_2, { from: admin }),
                '400.4'
            );
        });

        it('taker order filled', async function () {
            await this.dinngo.fillOrder(hash1, amountBase1);
            await expectRevert(
                this.dinngo.settle(orders1_2, sigs1_2, { from: admin }),
                '400.8'
            );
        });

        it('maker order filled', async function () {
            await this.dinngo.fillOrder(hash2, amountBase2);
            await expectRevert(
                this.dinngo.settle(orders1_2, sigs1_2, { from: admin }),
                '400.8'
            );
        });

        it('from owner', async function () {
            await expectRevert(
                this.dinngo.settle(orders1_2, sigs1_2, { from: owner }),
                '403.1'
            );
        });

        it('Not admin', async function () {
            await expectRevert(
                this.dinngo.settle(orders1_2, sigs1_2),
                '403.1'
            );
        });
    });

    describe('settle for selling taker', function () {
        const orders1_2 =
            '0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000001020000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000002030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000004563918244f40000000b0000000c';
        const sigs1_2 =
            '0xfc89844ed1f83b0902aff9b0125e3220b8a946261f70411a46fe5459b4a0267900098a93b03c4bf2cf93dc2b61198e6e00a129b0278d014ebbdd9291b527469201a439351ebc9e1c57b5cf66b31555f52b6b3e2b58dbfc92db8acc01ddd389ce2c235f78e053c94c8a153d1e7026c64bcbd576db99dd28d7e508a0fc0ac4f637cc00';
        const orders1_3 =
            '0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000001020000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000003030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000004563918244f40000000b0000000d';
        const sigs1_3 =
            '0xfc89844ed1f83b0902aff9b0125e3220b8a946261f70411a46fe5459b4a0267900098a93b03c4bf2cf93dc2b61198e6e00a129b0278d014ebbdd9291b52746920159c41ee03b815fb3ea196a8371da7e4dd2f6269ff9bd9546bc8cc3a893a90cd95a7ebe92f87c58f1591048bf930420c68e6407c1c26fac2136d1e09e2ff7e39001';
        const orders1_4 =
            '0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000001020000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000004030000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000e';
        const sigs1_4 =
            '0xfc89844ed1f83b0902aff9b0125e3220b8a946261f70411a46fe5459b4a0267900098a93b03c4bf2cf93dc2b61198e6e00a129b0278d014ebbdd9291b5274692016eb7d9a21940d1c05680fc0e056030770ce108079e7dd018e6af71f4eaaeef382f94c4bb8a178665e3ada930e40d72d1bd7a77f7d40bff400a70fce8d6cd679a00';

        const hash1 = '0x67597dacdada87d5452b5ec39ef636552985de0aa68ee61997f039fa404a5d1e';
        const hash2 = '0x47361905672590148c0e352b638cc3a9c95a81eca15cfc2dfe01dcc8dff1c936';
        const hash3 = '0x4f8bf6afba11fb10305d7c152cfd050bfed9adaec92f2ca3577a49e4eaa6f3a9';
        const hash4 = '0xa8ecf03101d10efd4a1454a853f47456d6d1f9cbb7b8cd6906f69b1ea088558b';

        const tokenBase = token;
        const tokenQuote = ZERO_ADDRESS;

        const amountBase1 = ether('10');
        const amountQuote1 = ether('2');
        const tradeFee1 = ether('0.1');
        const gasFee1 = ether('0.001');
        const isBuy1 = false;
        const isFeeMain1 = true;

        const amountBase2 = ether('5');
        const amountQuote2 = ether('1');
        const tradeFee2 = ether('0.1');
        const gasFee2 = ether('0.001');
        const isBuy2 = true;
        const isFeeMain2 = true;

        const amountBase3 = ether('5');
        const amountQuote3 = ether('1');
        const tradeFee3 = ether('0.1');
        const gasFee3 = ether('0.001');
        const isBuy3 = true;
        const isFeeMain3 = true;

        const amountBase4 = ether('10');
        const amountQuote4 = ether('2');
        const tradeFee4 = ether('0.1');
        const gasFee4 = ether('0.001');
        const isBuy4 = true;
        const isFeeMain4 = true;

        it('Normal', async function () {
            const { logs } = await this.dinngo.settle(orders1_2, sigs1_2, { from: admin });
            inLogs(logs, 'Trade',
                {
                    user: user2,
                    isBuy: true,
                    tokenBase: tokenBase,
                    amountBase: amountBase2,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote2,
                    tokenFee: tokenBase,
                    amountFee: tradeFee2.add(gasFee2)
                }
            );
            inLogs(logs, 'Trade',
                {
                    user: user1,
                    isBuy: false,
                    tokenBase: tokenBase,
                    amountBase: amountBase2,
                    tokenQuote: tokenQuote,
                    amountQuote: amountQuote2,
                    tokenFee: tokenQuote,
                    amountFee: tradeFee1.mul(amountBase2).div(amountBase1).add(gasFee1)
                }
            );

            const user1Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            const user1DGO = await this.dinngo.balances.call(DGO, user1);
            const user1Token = await this.dinngo.balances.call(token, user1);
            const user2Ether = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            const user2DGO = await this.dinngo.balances.call(DGO, user2);
            const user2Token = await this.dinngo.balances.call(token, user2);
            const walletEther = await this.dinngo.getWalletBalance.call(ZERO_ADDRESS);
            const walletDGO = await this.dinngo.getWalletBalance.call(DGO);
            const walletToken = await this.dinngo.getWalletBalance.call(token);
            expect(user1Ether).to.be.bignumber.eq(
                balance.add(
                    amountQuote2
                ).sub(
                    tradeFee1.mul(amountBase2).div(amountBase1)
                ).sub(
                    gasFee1
                )
            );
            expect(user1DGO).to.be.bignumber.eq(balance);
            expect(user1Token).to.be.bignumber.eq(
                balance.sub(
                    amountBase2
                )
            );
            expect(user2Ether).to.be.bignumber.eq(
                balance.sub(
                    amountQuote2
                )
            );
            expect(user2DGO).to.be.bignumber.eq(balance);
            expect(user2Token).to.be.bignumber.eq(
                balance.add(
                    amountBase2
                ).sub(
                    tradeFee2
                ).sub(
                    gasFee2
                )
            );
            expect(walletEther).to.be.bignumber.eq(
                balance.add(
                    tradeFee1.mul(amountQuote2).div(amountQuote1)
                ).add(
                    gasFee1
                )
            );
            expect(walletDGO).to.be.bignumber.eq(balance);
            expect(walletToken).to.be.bignumber.eq(
                balance.add(
                    tradeFee2
                ).add(
                    gasFee2
                )
            );
            const amount1 = await this.dinngo.orderFills.call(hash1);
            const amount2 = await this.dinngo.orderFills.call(hash2);
            expect(amount1).to.be.bignumber.eq(amountBase2);
            expect(amount2).to.be.bignumber.eq(amountBase2);
            await this.dinngo.settle(orders1_3, sigs1_3, { from: admin });
        });

        it('Normal 1-4', async function () {
            await this.dinngo.settle(orders1_4, sigs1_4, { from: admin });
        });
    });
});
