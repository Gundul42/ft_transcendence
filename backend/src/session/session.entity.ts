import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity()
export class Session extends BaseEntity{
	@PrimaryColumn()
	sessionid: string;

	@Column()
	userid: number;

	@Column()
	ip_address: string | null;

	@Column()
	created_on: Date;

	@Column()
	state: string;
}