import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

let nextId = 1

@Entity()
export class Film {

  @PrimaryGeneratedColumn()
  id: number = nextId++

  @Column('varchar')
  name: string = ''

  @Column('varchar')
  imageURL: string = ''

  @Column('varchar')
  altText: string = ''

  @Column('varchar')
  imdbURL: string = ''

  @Column('smallint')
  votes: number = 0

  constructor() {}

  vote() {
    this.votes++
  }

  validate() {}
}