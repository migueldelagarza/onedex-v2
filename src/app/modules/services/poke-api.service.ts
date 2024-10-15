import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Pokemon } from '../pokedex/interfaces/pokemon';

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly _url = 'https://pokeapi.co/api/v2/pokemon';
  private readonly _imageUrl = 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/:index.png'
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
        imageUrl: this._imageUrl.replace(':index', String(pokemon.id).padStart(3,'0'))
      }))
    )
  }
}