import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Length, IsAlpha, IsEmail } from 'class-validator'
import * as bcrypt from 'bcrypt'

@Entity()
@Unique(['email'])
export class User {

	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	@Length(4, 20, { groups: ['edit'] })
	@IsAlpha(undefined, { groups: ['edit'] })
	name!: string

	@Column()
	@IsEmail()
	email!: string

	@Column({ select: false })
	@Length(8, 100)
	password!: string

	@Column({ select: false, nullable: true })
	passwordResetToken!: string

	@Column({ select: false, nullable: true })
	passwordResetExpires!: Date

	@Column()
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt!: Date

	@Column()
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt!: Date

	hashPassword() {
		this.password = bcrypt.hashSync(this.password, 8)
	}

	checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
		return bcrypt.compareSync(unencryptedPassword, this.password)
	}

}