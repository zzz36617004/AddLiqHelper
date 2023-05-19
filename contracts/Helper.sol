//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "./interfaces/IUniswapV2Pair.sol";

import "./libraries/Ownable2StepUpgradeable.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IUniswapV2Router.sol";


contract Helper is Ownable2StepUpgradeable{
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IUniswapV2Router public uniswapV2Router;

    /* ========== INITIALIZER ========== */

    function initialize(address router) external initializer {
        __Ownable2Step_init();
        uniswapV2Router = IUniswapV2Router(router);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function singleTokenAddLiquidity(
        IUniswapV2Pair pair,
        address tokenA,
        uint256 singleAmount,
        address to,
        uint256 deadline
    ) external {
        address _tokenA = pair.token0();
        address _tokenB = pair.token1();
        require(_tokenA == tokenA || _tokenB == tokenA, "Helper : invalid Token");
        require(IERC20(tokenA).balanceOf(msg.sender) >= singleAmount, "Helper : insufficient Amount");
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), singleAmount);

        address tokenB = tokenA == _tokenA ? _tokenB : _tokenA;
        _approve(tokenA, address(uniswapV2Router));
        _approve(tokenB, address(uniswapV2Router));
        uint256[] memory swapAmount;
        uint256 halfAmount;

        {
            halfAmount = singleAmount / 2;
            address[] memory path = new address[](2);
            path[0] = tokenA;
            path[1] = tokenB;
            swapAmount = uniswapV2Router.swapExactTokensForTokens(halfAmount, 1, path, address(this), deadline);
        }

        uniswapV2Router.addLiquidity(tokenA, tokenB, halfAmount, swapAmount[swapAmount.length - 1], 0, 0, to, deadline);
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function _approve(address token, address spender) private {
        if (IERC20(token).allowance(address(this), spender) != type(uint).max) {
            IERC20(token).safeApprove(spender, type(uint).max);
        }
    }
}
