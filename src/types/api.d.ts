export declare function fetchData<T>(url: string, username: string): Promise<T>
export declare function fetchAllCurrentRatings(
  username: string
): Promise<Ratings>
export declare function fetchGames(username: string): Promise<ChessGame[]>
