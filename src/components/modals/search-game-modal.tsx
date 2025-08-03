"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGameContext } from "@/context/useGameContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchSteamGameDetails } from "@/services/game/useGameService";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

export function SearchGameModal() {
  const [isOpen, setIsOpen] = useQueryState("search-game-modal", parseAsBoolean.withDefault(false));
  const { gamesByMenu } = useGameContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: gameSearchResults, isLoading } = useFetchSteamGameDetails(
    debouncedSearchTerm,
    {
      enabled: debouncedSearchTerm.length >= 3 && showSearchResults,
    }
  );

  // Auto-search quando o usuário digita
  useEffect(() => {
    if (searchTerm.length >= 3) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  // Esconder resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const searchContainer = target.closest('.search-container');
      const searchResults = target.closest('.search-results');
      
      if (!searchContainer && !searchResults) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const onClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setShowSearchResults(false);
  };

  const filterGamesFromLibrary = () => {
    if (!searchTerm) return gamesByMenu;
    
    return gamesByMenu.filter(game =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredGames = filterGamesFromLibrary();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md ps5-card border-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white ps5-text-glow text-xl font-semibold flex items-center gap-3">
            <Icons.Search className="text-blue-400 size-5" />
            Search Games
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Search for games in your library or browse Steam.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="search-container relative">
            <Input
              placeholder="Type to search for a game..."
              className="w-full bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <Icons.Loader className="size-4 animate-spin text-blue-400" />
              ) : searchTerm.length >= 3 ? (
                <Icons.Search className="size-4 text-blue-400" />
              ) : (
                <Icons.Search className="size-4 text-gray-400" />
              )}
            </div>
            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <div className="absolute -bottom-6 left-0">
                <span className="text-gray-400 text-xs">
                  Type at least 3 characters to search Steam
                </span>
              </div>
            )}
          </div>

          {/* Your Library Results */}
          {searchTerm && (
            <div className="max-h-48 overflow-y-auto bg-gray-800/50 rounded-lg border border-gray-600">
              <div className="p-2">
                <div className="mb-2 px-2">
                  <p className="text-gray-400 text-xs">Your Library ({filteredGames.length} results):</p>
                </div>
                {filteredGames.length > 0 ? (
                  filteredGames.slice(0, 3).map((game, index) => (
                    <div
                      key={`${game.name}-${index}`}
                      className="w-full flex items-center gap-3 p-3 rounded hover:bg-gray-700/50 border border-transparent transition-all duration-200"
                    >
                      {game.iconUrl && (
                        <img
                          src={game.iconUrl}
                          alt={game.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <span className="text-white text-sm font-medium truncate block">
                          {game.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {'platform' in game ? game.platform : 'Steam'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-gray-400 text-sm">No games found in your library</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Steam Search Results */}
          {showSearchResults && searchTerm.length >= 3 && (
            <div className="search-results max-h-48 overflow-y-auto bg-gray-800/50 rounded-lg border border-gray-600">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Icons.Loader className="size-6 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">Searching Steam...</p>
                </div>
              ) : gameSearchResults && gameSearchResults.results.length > 0 ? (
                <div className="p-2">
                  <div className="mb-2 px-2">
                    <p className="text-gray-400 text-xs">Steam Results:</p>
                  </div>
                  {gameSearchResults.results.slice(0, 5).map((game) => (
                    <div
                      key={game.iconUrl}
                      className="w-full flex items-center gap-3 p-3 rounded hover:bg-gray-700/50 hover:border-blue-500/50 border border-transparent transition-all duration-200 text-left group"
                    >
                      <img
                        src={game.iconUrl}
                        alt={game.name}
                        className="w-10 h-10 rounded object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1">
                        <span className="text-white text-sm font-medium truncate block">
                          {game.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          Steam
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length >= 3 ? (
                <div className="p-4 text-center">
                  <Icons.Search className="size-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No games found on Steam</p>
                  <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-gray-500/20 backdrop-blur-md border border-gray-400/30 hover:bg-gray-500/30 transition-all duration-300 text-gray-300 font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
