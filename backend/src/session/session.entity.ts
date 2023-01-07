import { Entity, Column, PrimaryColumn, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { AppUser } from '../user/user.entity';

@Entity()
export class Session extends BaseEntity{
	@PrimaryColumn()
	sessionid: string;

	@Column("int", {nullable: true})
	userid: number;

	@OneToOne(() => AppUser, {cascade: true})
	@JoinColumn({name: 'userid'})
	user: AppUser | null;

	@Column()
	ip_address: string | null;

	@Column()
	created_on: Date;

	@Column()
	state: string;
}