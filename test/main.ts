var context = (require as any).context('.', true, /\.(ts|js)$/);
context.keys().forEach(context);
module.exports = context;