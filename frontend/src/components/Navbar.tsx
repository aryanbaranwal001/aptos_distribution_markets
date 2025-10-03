'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { WalletSelector } from './WalletSelector';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import SearchResults from './SearchResults';

const Navbar = () => {
  const { color, nextColor } = useThemeStore();
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const theme = getThemeClasses(color);

  const handleMenuMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setIsMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 150); // 150ms delay
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${theme.background} ${theme.text}`}>
        {/* Top Navbar */}
        <div className="px-12 sm:px-24 lg:px-48">
          <div className="flex items-center justify-between h-16">
            {/* Company Name */}
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 flex-shrink-0">
                  <svg 
                    viewBox="0 0 1024 1024" 
                    className={`w-full h-full transition-colors duration-200`}
                    style={{ fill: `var(--theme-primary-${color})` }}
                  >
                    <path d="M614.477051,595.475708 C599.121704,611.927063 582.874817,626.995850 567.233276,642.670715 C557.469360,652.455444 547.561584,662.076904 537.484192,671.543701 C525.037415,683.236328 508.679138,681.471985 497.908783,671.103394 C477.047607,651.020386 456.735016,630.367859 436.170197,609.976440 C432.628540,606.464722 429.010712,603.026184 425.341919,599.647400 C422.183990,596.739075 421.731018,593.749695 424.850983,590.617065 C435.195190,580.230591 445.533997,569.837830 455.972321,559.546387 C459.636536,555.933655 463.581757,556.351257 467.268951,560.101135 C482.801208,575.897095 498.412842,591.614990 513.931763,607.423950 C516.794312,610.340027 518.961243,610.735229 522.168579,607.499268 C549.725281,579.696960 577.407776,552.018921 605.122803,524.374146 C624.816650,504.730255 644.688232,485.264404 664.354309,465.592957 C686.962891,442.978180 709.401184,420.193237 731.971741,397.540344 C750.895874,378.547272 769.649597,359.374084 788.948608,340.767944 C807.048767,323.317596 823.944153,304.658813 842.579529,287.759125 C843.937988,286.527252 845.206970,285.237030 844.825500,281.708466 C626.871338,281.856201 408.965607,281.048126 190.879105,281.436951 C190.670395,285.370361 192.499252,286.743591 193.953293,288.190277 C221.686371,315.782806 249.489731,343.304749 277.198090,370.922058 C298.293915,391.948547 319.271698,413.093445 340.318542,434.169128 C343.022034,436.876312 345.834778,439.474182 348.580078,442.139984 C351.403168,444.881287 351.998260,447.599091 348.953430,450.746948 C338.765686,461.279327 328.852112,472.077789 318.141815,482.098785 C315.016937,485.022552 312.103210,485.136261 309.009979,482.067993 C292.456299,465.647644 275.845398,449.284973 259.305328,432.850952 C240.051163,413.720306 220.828293,394.558044 201.630478,375.370819 C172.661484,346.417816 143.723801,317.433472 114.778214,288.457092 C109.953430,283.627167 105.279938,278.638947 100.323418,273.949127 C84.088425,258.587677 94.260582,231.056274 112.449364,227.607208 C116.703453,226.800507 120.805176,225.837570 125.177719,225.861542 C152.842300,226.013290 180.514664,225.675995 208.170792,226.209045 C244.164902,226.902786 280.154083,226.646469 316.146271,226.647461 C417.796051,226.650314 519.446533,226.874649 621.095276,226.553116 C652.584534,226.453522 684.080933,225.792892 715.568054,226.173279 C746.886230,226.551620 778.202148,226.755051 809.519592,226.628876 C844.497314,226.487961 879.473938,226.002411 914.451599,225.923386 C926.109985,225.897049 935.533813,230.572998 940.688904,241.611786 C946.216431,253.448059 944.331848,265.335999 935.430786,274.298309 C911.953186,297.937378 888.372314,321.474121 864.784912,345.003845 C837.896973,371.825958 810.891418,398.530365 784.054504,425.403290 C731.916321,477.611420 679.860413,529.901672 627.769714,582.157227 C623.422913,586.517761 619.071045,590.873169 614.477051,595.475708 z"/>
                    <path d="M598.432678,430.574402 C602.692993,434.326843 606.765503,437.757416 610.298767,441.774414 C613.997803,445.979828 613.865784,448.041016 609.975159,451.897980 C600.273499,461.515594 590.703979,471.266388 581.008728,480.890533 C576.241272,485.623016 574.079224,485.712646 569.304260,480.944550 C555.050354,466.711212 540.924805,452.349274 526.755676,438.031189 C525.584900,436.848145 524.504883,435.573669 523.311462,434.415009 C518.138672,429.392731 517.521912,429.385559 512.529419,434.475433 C497.131927,450.173340 481.819519,465.955322 466.347778,481.579590 C447.598511,500.513580 428.730347,519.329895 409.895508,538.179016 C386.358551,561.733887 362.788727,585.255920 339.260254,608.819214 C320.323822,627.783691 301.473206,646.833984 282.503021,665.764526 C253.262131,694.944336 223.942307,724.045044 194.698898,753.222290 C193.283218,754.634827 190.511551,755.807983 191.791443,758.384827 C192.820084,760.455750 195.361206,759.731934 197.294205,759.733032 C320.947235,759.801147 444.600311,759.857666 568.253357,759.884399 C658.243591,759.903870 748.233887,759.887390 838.224121,759.841675 C840.600098,759.840454 843.245422,760.630554 845.223145,758.576782 C845.523315,756.849854 844.355591,756.044373 843.431030,755.120178 C809.407837,721.111511 775.390991,687.096558 741.352783,653.102905 C723.799622,635.572632 706.189087,618.099792 688.645935,600.559570 C683.933899,595.848206 683.793396,593.882019 688.376221,589.311829 C698.277893,579.437378 708.356689,569.740112 718.385864,559.993835 C721.611816,556.858887 724.841064,557.006226 727.992554,560.171875 C741.272583,573.511719 754.541199,586.863098 767.842163,600.182007 C822.351257,654.764709 876.850464,709.357239 931.419556,763.879822 C936.495056,768.950989 940.238831,774.650940 942.190552,781.544861 C946.338257,796.195068 935.477783,815.234619 917.641907,815.231628 C736.161194,815.201050 554.680420,815.203918 373.199707,815.214050 C289.375549,815.218689 205.550552,815.079041 121.727943,815.452271 C106.666656,815.519348 94.690422,806.817810 92.520386,791.326416 C91.191887,781.842529 94.282654,774.084229 101.004166,767.431274 C123.019798,745.640137 145.005219,723.817932 166.907776,701.913269 C192.212418,676.606140 217.373856,651.155884 242.677155,625.847412 C266.097961,602.421753 289.801331,579.276184 313.064362,555.695679 C353.414124,514.795105 394.274506,474.411377 435.115784,434.005035 C455.472809,413.864838 475.381866,393.272217 495.532104,372.922424 C501.642151,366.751923 508.555267,362.022675 517.687622,361.936218 C526.427307,361.853485 533.310913,365.988495 539.279297,371.892151 C558.941711,391.341583 578.552002,410.843689 598.432678,430.574402 z"/>
                  </svg>
                </div>
                <h1 className={`text-xl font-extrabold tracking-wide ${theme.primary}`}>
                  Infi Markets
                </h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className={`relative ${isSearchOpen ? theme.searchBg : theme.cardBg} ${isSearchOpen ? 'rounded-t-lg border border-b-0' : 'rounded-lg'} ${isSearchOpen ? theme.searchBorder : ''}`}>
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search for a market..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    className={`search-input w-full pl-10 pr-4 py-2 bg-transparent ${theme.text} placeholder-gray-400 outline-none ${isSearchOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchOpen && (
                  <div className={`absolute top-full left-0 right-0 ${theme.searchBg} rounded-b-lg shadow-xl z-50 border border-t ${theme.searchBorder}`} style={{ height: '384px' }}>
                    <SearchResults onClose={() => setSearchOpen(false)} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">


              {/* Demo Button */}
              <Link
                href="/instance/1"
                className={`px-4 py-2 rounded-2xl transition-all border-2 ${theme.border} ${theme.textSecondary} hover:bg-gray-500/25 whitespace-nowrap`}
              >
                Demo
              </Link>

              {/* Connect Wallet Button */}
              <div className="wallet-selector-wrapper">
                <WalletSelector />
              </div>

              {/* Hamburger Menu */}
              <div
                className="relative"
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuMouseLeave}
              >
                <button
                  className={`p-2 rounded-lg ${theme.textSecondary} hover:${theme.primary} hover:bg-gray-600/15 transition-all duration-200`}
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Invisible bridge to prevent menu from closing */}
                {isMenuOpen && (
                  <div className="absolute top-full right-0 w-40 h-4 z-40" />
                )}
                
                {/* Hamburger Menu Dropdown */}
                <div className={`absolute top-full right-0 mt-4 w-40 ${theme.cardBg} border ${theme.border} rounded-lg shadow-lg z-50 transition-all duration-200 ease-out ${
                  isMenuOpen 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-[-10px] scale-95 pointer-events-none'
                } sm:right-0 xs:right-[-12px]`}>
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      className={`block px-4 py-2 ${theme.textSecondary} hover:${theme.primary} hover:bg-gray-600/10 transition-colors`}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={nextColor}
                      className={`w-full text-left px-4 py-2 ${theme.textSecondary} hover:${theme.primary} hover:bg-gray-600/10 transition-colors`}
                    >
                      Theme: {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </nav>

    </>
  );
};

export default Navbar;
