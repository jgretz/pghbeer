export const TableName = tableName => target => {
  target.prototype.tableName = tableName;
};
