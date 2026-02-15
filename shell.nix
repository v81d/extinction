{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    nodejs_24
  ];

  shellHook = ''
    echo -e "\033[1;32mWelcome to the Extinction development environment!\033[0m"
    echo -e "\033[1;34mAvailable aliases:\033[0m"

    alias i='npm install'
    alias b-firefox='TARGET=firefox npm run build'
    alias b-chrome='TARGET=chrome npm run build'

    echo -e "  \033[1;33mi\033[0m           npm install"
    echo -e "  \033[1;33mb-firefox\033[0m   TARGET=firefox npm run build"
    echo -e "  \033[1;33mb-chrome\033[0m    TARGET=chrome npm run build"

    echo
  '';
}
