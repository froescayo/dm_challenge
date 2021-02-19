import Knex from "knex";
import { v4 as uuid } from "uuid";
import { Base } from "../db";

export const pageSetting = {
  page: 1,
  pageSize: 8,
};

export abstract class Repository<T extends Base> {
  constructor(public readonly knex: Knex, public readonly tableName: string) {}

  /**
   * Insere um objeto e retorna a instância criada
   *
   * @param {(Omit<T, "id">)} item objeto a ser inserido
   * @returns {Promise<T>} instância do objeto criado
   * @memberof Repository
   */
  async insert(
    item: Omit<T, "id" | "createdAt" | "updatedAt" | "deletedAt"> & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date;
      deletedAt?: Date;
    },
    knex?: Knex,
  ): Promise<T> {
    if (knex === undefined) {
      return this.knex.transaction(async trx => this.insert(item, trx));
    }

    const [result]: T[] = await knex(this.tableName)
      .insert({
        id: uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...item,
      })
      .returning("*");

    return result;
  }

  /**
   * Obtém a última versão de um objeto através de parâmetro(s) do mesmo
   *
   * @param {Partial<T>} condition parâmetros do objeto a serem utilizadas na condição de busca
   * @param {(qb: Knex.QueryBuilder) => Knex.QueryBuilder} queryBuilder callback síncrono possibilitando adicionar mais parâmetros na condição de busca
   * @returns {(Promise<T | undefined>)} instância do objeto ou undefined se não encontrado
   */
  async findOneBy(
    condition: Partial<T>,
    queryBuilder?: (qb: Knex.QueryBuilder) => Knex.QueryBuilder,
    knex?: Knex,
  ): Promise<T | undefined> {
    if (knex === undefined) {
      return this.knex.transaction(async trx => this.findOneBy(condition, queryBuilder, trx));
    }

    const query = knex(this.tableName)
      .select()
      .whereNull("deletedAt")
      .where({ ...condition })
      .first();

    if (queryBuilder) {
      queryBuilder(query);
    }

    return query;
  }

  /**
   * Obtém uma sequência de objetos de acordo com um limite e pagina de busca
   *
   * @param {number} page página na qual deseja-se realizar a busca
   * @param {number} pageSize limite de itens retornados pela busca
   * @param {Partial<T>} condition parâmetros dos objetos a serem utilizadas na condição de busca
   * @returns {(Promise<{data: T[], page<number>, pageCount<number>, pageSize<number>, rowCount<number>})} instância do objeto contendo a pesquisa realizada e configurações da pesquisa
   */
  async findAllPaginated(
    page: number | null,
    pageSize: number | null,
    condition?: Partial<T>,
    queryBuilder?: (qb: Knex.QueryBuilder) => Knex.QueryBuilder,
  ): Promise<{ data: T[]; page: number; pageCount: number; pageSize: number; rowCount: number }> {
    const searchPage = page ?? pageSetting.page;
    const searchLimit = pageSize ?? pageSetting.pageSize;

    const total = await this.count(condition, queryBuilder);

    const search = this.knex(this.tableName)
      .select()
      .whereNull(`${this.tableName}.deletedAt`)
      .where({ ...(condition ?? {}) })
      .limit(searchLimit)
      .offset((searchPage - 1) * searchLimit);

    if (queryBuilder) {
      queryBuilder(search);
    }

    return {
      data: await search,
      page: searchPage,
      pageCount: Math.ceil(total / searchLimit),
      pageSize: searchLimit,
      rowCount: total,
    };
  }

  /**
   * Obtém a contagem de objetos através de parâmetro(s) do mesmo
   *
   * @param {Partial<T>} condition parâmetros do objeto a serem utilizadas na condição de busca
   * @param {(qb: Knex.QueryBuilder) => void} queryBuilder callback síncrono possibilitando adicionar mais parâmetros na condição de busca
   * @returns {(Promise<number>)} contagem de objetos
   */
  async count(condition?: Partial<T>, queryBuilder?: (qb: Knex.QueryBuilder) => void): Promise<number> {
    const query = this.knex(this.tableName)
      .select()
      .whereNull(`${this.tableName}.deletedAt`)
      .where({ ...(condition ?? {}) })
      .count({ count: 1 })
      .first();

    if (queryBuilder) {
      queryBuilder(query);
    }

    return parseInt(((await query)?.count ?? "0").toString(), 10);
  }

  /**
   * Obtém a última versão de todos os objetos
   *
   * @returns {(Promise<Array<T | undefined>>)} array com a instância dos objetos
   */
  async findAll(): Promise<T[]> {
    return this.knex(this.tableName).select().whereNull("deletedAt");
  }

  /**
   * Obtém a última versão de alguns objetos através de parâmetro(s) dos mesmos
   *
   * @param {Partial<T>} condition parâmetros dos objetos a serem utilizadas na condição de busca
   * @param {(qb: Knex.QueryBuilder) => Knex.QueryBuilder} queryBuilder callback síncrono possibilitando adicionar mais parâmetros na condição de busca
   * @returns {(Promise<Array<T | undefined>>)} array com a instância dos objetos encontrados
   */
  async findBy(
    condition: Partial<T>,
    queryBuilder?: (qb: Knex.QueryBuilder) => Knex.QueryBuilder,
    knex = this.knex,
  ): Promise<T[]> {
    const query = knex(this.tableName)
      .select()
      .whereNull(`${this.tableName}.deletedAt`)
      .where({ ...condition });

    if (queryBuilder) {
      queryBuilder(query);
    }

    return query;
  }

  /**
   * Obtém a última versão de um objeto através do identificador
   *
   * @param {string} id identificador do objeto
   * @returns {(Promise<T | undefined>)} instância do objeto ou undefined se não encontrado
   */
  async get(id: string): Promise<T | undefined> {
    return this.findOneBy({ id } as Partial<T>);
  }

  /**
   * Atualiza uma instância de um objeto
   *
   * É iniciada uma transação onde:
   *
   * - É checado se o objeto realmente existe antes de atualizar (e dá erro se o objeto não existir)
   * - A entrada anterior do objeto é marcada como versão antiga
   * - É criada uma nova entrada do objeto marcada como versão mais recente e com os dados atualizados
   * - A tabela de estado atual é atualizada com os parâmetros enviados
   *
   * @param {(Partial<T> & Pick<T, "id">)} item objeto a ser atualizado
   * @returns {Promise<T>} objeto atualizado
   * @throws NotFound
   */
  async update(item: Partial<T> & Pick<T, "id">, knex?: Knex): Promise<T> {
    if (knex === undefined) {
      return this.knex.transaction(async trx => this.update(item, trx));
    }

    const now = new Date();

    const current: T | undefined = await knex(this.tableName)
      .select()
      .whereNull("deletedAt")
      .where({ id: item.id })
      .first()
      .forUpdate();

    if (!current) {
      throw new Error("Não encontrado");
    }

    const [updatedItem]: T[] = await knex(this.tableName)
      .whereNull("deletedAt")
      .where({ id: item.id })
      .update({
        ...item,
        updatedAt: now,
      })
      .returning("*");

    return updatedItem;
  }

  /**
   * Exclui a instância de um objeto através do identificador
   *
   * @param {string} id identificador do objeto
   * @returns {Promise<T>} objeto excluído
   * @throws NotFound
   */
  async delete(id: string): Promise<T> {
    return this.knex.transaction(async trx => {
      const current: T | undefined = await trx(this.tableName)
        .select()
        .whereNull("deletedAt")
        .where({ id })
        .first()
        .forUpdate();

      if (!current) {
        throw new Error("Não encontrado");
      }

      const now = new Date();
      const [deleted]: Array<T | undefined> = await trx(this.tableName)
        .whereNull("deletedAt")
        .where({ id })
        .update({ updatedAt: now, deletedAt: now })
        .returning("*");

      if (!deleted) {
        throw new Error(`BUG: deleted: ${deleted}`);
      }

      return deleted;
    });
  }

  /**
   * Exclui múltiplos objetos através da condição especificada
   *
   * @param {Partial<T>} condition parâmetros dos objetos a serem utilizadas na condição de busca
   * @param {(qb: Knex.QueryBuilder) => Knex.QueryBuilder} queryBuilder callback síncrono possibilitando adicionar mais parâmetros na condição de busca
   * @returns {(Promise<Array<T | undefined>>)} array com a instância dos objetos removidos
   */
  async deleteBy(
    condition: Partial<T>,
    knex?: Knex,
    queryBuilder?: (qb: Knex.QueryBuilder) => Knex.QueryBuilder,
  ): Promise<T[]> {
    if (knex === undefined) {
      return this.knex.transaction(async trx => this.deleteBy(condition, trx, queryBuilder));
    }

    const now = new Date();

    const query = knex(`${this.tableName}`)
      .whereNull("deletedAt")
      .where({ ...condition })
      .update({ updatedAt: now, deletedAt: now })
      .returning("*");

    queryBuilder?.(query);

    const queryReturn: T[] = await query;

    return queryReturn;
  }
}
