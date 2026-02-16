{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    vue-language-server
    vtsls
    prettier
    nodejs_24
  ];

  shellHook = ''
    echo -e "\033[1;32mWelcome to the Extinction development environment!\033[0m"
    echo -e "\033[1;34mAvailable aliases:\033[0m"

    i() { npm install "$@"; }
    b-firefox() { TARGET=firefox npm run build "$@"; }
    b-chrome() { TARGET=chrome npm run build "$@"; }

    export -f i b-firefox b-chrome

    echo -e "  \033[1;33mi\033[0m           npm install"
    echo -e "  \033[1;33mb-firefox\033[0m   TARGET=firefox npm run build"
    echo -e "  \033[1;33mb-chrome\033[0m    TARGET=chrome npm run build"

    echo
  '';
}
