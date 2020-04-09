const xss = require('xss');

const CommentsService = {
  getById(db, id) {
    return db
      .from('geekbox_comments AS comm')
      .select(
        'comm.id',
        'comm.rating',
        'comm.comment',
        'comm.date_created',
        'comm.resource_id',
        db.raw(
          `row_to_json(
            (SELECT tmp FROM (
                SELECT
                    usr.id,
                    usr.first_name,
                    usr.last_name,
                    usr.user_name,
                    usr.date_created,
                    usr.date_modified
            ) tmp)
        ) AS "user"`,
        ),
      )
      .leftJoin(
        'geekbox_users AS usr',
        'comm.user_id',
        'usr.id',
      )
      .where('comm.id', id)
      .first();
  },

  insertComment(db, newComment) {
    return db
      .insert(newComment)
      .into('geekbox_comments')
      .returning('*')
      .then(([comment]) => comment)
      .then((comment) => CommentsService.getById(db, comment.id));
  },

  serializeComment(comment) {
    return {
      id: comment.id,
      rating: comment.rating,
      comment: xss(comment.comment),
      date_created: comment.date_created,
      resource_id: comment.resource_id,
      user: comment.user || {},
    };
  },
};

module.exports = CommentsService;
