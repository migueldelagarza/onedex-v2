import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Pokemon } from '../modules/pokedex/interfaces/pokemon';
import { POKEAPI_V2_URL, POKEMON_IMAGES_URL } from '../consts/api-urls.constants';

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly _url = POKEAPI_V2_URL;
  private readonly _imageUrl = POKEMON_IMAGES_URL;
  private readonly _http = inject(HttpClient);

  getPokemon(name: string = ''): Observable<Pokemon[]> {
    return this._http.get(this._url + name + '?limit=150').pipe(
      map((response: any) => response.results)
    )
  }

  getPokemonDetail(name: string): Observable<any> {
    const specie = this._http.get<Pokemon>(this._url + '/' + name).pipe(
      switchMap((pokemon: any) => this._http.get<Pokemon>(pokemon.species.url))
    )
    const pokemon = this._http.get<Pokemon>(this._url + '/' + name);
    return forkJoin({ pokemon, specie }).pipe(
      map(({ pokemon, specie }) => ({
        ...pokemon,
        species: {
          ...specie
        },
        imageUrl: this._getPokemonImage(pokemon)
      }))
    );
  }

  private _getPokemonImage(pokemon: Pokemon): string {
    const indexString = String(pokemon.id).padStart(3, '0');
    return this._imageUrl.replace(':index', indexString);
  }
}