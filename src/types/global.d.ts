type Maybe<T> = T | null | undefined;

type NextApiRequestParams<Params, Slug extends object = null> = Slug extends null
  ? { params: Params }
  : { params: Params & { slug: Slug } };