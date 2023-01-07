import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity()
export class AppUser extends BaseEntity{
	@PrimaryColumn()
	userid: string;

	@Column()
	email: string;

	@Column()
	full_name: string;

	@Column()
	access_token: string;

	@Column()
	token_type: string;

	@Column()
	expires_in: number;

	@Column()
	refresh_token: string;

	@Column()
	scope: string;

	@Column()
	created_at: number;
}