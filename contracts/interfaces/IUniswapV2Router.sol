// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IUniswapV2Router {
    function factory() external pure returns (address);

    /// @notice A => B 스왑시, A의 수량을 고정하여 스왑하는 함수
    /// @param amountIn 스왑하려는 토큰의 수량
    /// @param amountOutMin 슬리피지 적용 시 스왑 후 받아야 하는 토큰의 최소 수량
    /// @param path 스왑 경로, tokenA => B 스왑 시 [A, B]가 됨
    /// @param to 스왑 후 토큰을 수령할 사용자의 주소
    /// @param deadline 시간 제한을 둘 블록 타임스탬프
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /// @notice A => B 스왑시, B의 수량을 고정하여 스왑하는 함수
    /// @param amountOut 스왑후 받아야 하는 토큰의 수량
    /// @param amountInMax 슬리피지 적용 시 스왑하려는 토큰의 최대 수량
    /// @param path 스왑 경로, tokenA => B 스왑 시 [A, B]가 됨
    /// @param to 스왑 후 토큰을 수령할 사용자의 주소
    /// @param deadline 시간 제한을 둘 블록 타임스탬프
    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /// @notice 토큰 A-B 유동성 풀에 페어 예치를 지원하는 함수
    /// @param tokenA 토큰 A의 주소
    /// @param tokenB 토큰 B의 주소
    /// @param amountADesired 예치하려는 토큰 A의 수량
    /// @param amountBDesired 예치하려는 토큰 B의 수량
    /// @param amountAMin 슬리피지 적용 시 예치되어야 하는 토큰 A의 최소 수량
    /// @param amountBMin 슬리피지 적용 시 예치되어야 하는 토큰 B의 최소 수량
    /// @param to 예치 후 LP 토큰을 수령할 사용자의 주소
    /// @param deadline 시간 제한을 둘 블록 타임스탬프
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
    external
    returns (
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
}
