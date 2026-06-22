{
  description = "An ultra-lightweight AI content blocker extension.";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1"; # unstable Nixpkgs

  outputs = {self, ...} @ inputs: let
    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
      "aarch64-darwin"
    ];
    forEachSupportedSystem = f:
      inputs.nixpkgs.lib.genAttrs supportedSystems (
        system:
          f {
            inherit system;
            pkgs = import inputs.nixpkgs {
              inherit system;
              overlays = [inputs.self.overlays.default];
            };
          }
      );
  in {
    overlays.default = final: prev: rec {
      nodejs = prev.nodejs;
      yarn = prev.yarn.override {inherit nodejs;};
    };

    devShells = forEachSupportedSystem (
      {
        pkgs,
        system,
      }: {
        default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            nodejs
            vue-language-server
            vtsls
            prettier
            self.formatter.${system}
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
        };
      }
    );

    formatter = forEachSupportedSystem ({pkgs, ...}: pkgs.alejandra);
  };
}
