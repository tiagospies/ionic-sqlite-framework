angular.module("database_module")
.factory("SqliteRepositoryFactory", function ($q) {
	function SqliteRepositoryFactory() {
		init();
	}

	function init() {
		var deferred = $q.defer();
		window.ionic.Platform.ready(function () {
			if (window.cordova && window.SQLitePlugin) {
				window.sqlitePlugin.openDatabase({ name: "database_name" }, function (db) {
					db.transaction(function (tx) {
						// Verify if table exists
						tx.executeSql('SELECT name FROM sqlite_master WHERE type="table"', [], function (tx, res) {
							if (res.rows.length > 0) {
								deferred.resolve(true);
							} else {
								var sql = [];
							  	//Create table scripts
			                  	sql.push("CREATE TABLE IF NOT EXISTS Test (");
			                  	sql.push("Id INTEGER PRIMARY KEY AUTOINCREMENT, ");
			                  	sql.push("Name VARCHAR(40), ");
			                  	sql.push("Active BIT)");
			                  	tx.executeSql(sql.join(""));
                                  
								deferred.reject();
							}
						});
					}, function (err) {
						deferred.reject(err.toString());
					});
				});
			}
		});
		return deferred.promise;
	}

	SqliteRepositoryFactory.prototype.execSQL = function (sql, params) {
		var deferred = $q.defer();

		var result = [];
		window.ionic.Platform.ready(function () {
			if (window.cordova && window.SQLitePlugin) {
				window.sqlitePlugin.openDatabase({ name: "assistencia_facil" }, function (db) {
					db.transaction(function (tx) {
						tx.executeSql(sql, params, function (tx, res) {
							if (res.insertId > 0) {
								deferred.resolve(res.insertId);
								return;
							}
							for (var i = 0; i < res.rows.length; i++) {
								result.push(res.rows.item(i));
							}
							deferred.resolve(result);
						}, function (err) {
							console.log(err.error());
							deferred.reject(err.error());
						});
					}, function (err) {
						deferred.reject(err.toString());
					});
				});
			}
		});
		return deferred.promise;
	}

	SqliteRepositoryFactory.prototype.create = function (entity) {
		var deferred = $q.defer();

		var tableName = this.getTableName();
		var query = [];
		query.push("INSERT INTO ");
		query.push(tableName);
		query.push(" (");
			var keys = Object.keys(entity);
			keys.forEach(function (prop, index) {
				query.push(prop);
				if (index < keys.length - 1) {
					query.push(",");
				}
			});
			query.push(")");
			query.push(" VALUES ");
			query.push("(");
				keys.forEach(function (prop, index) {
					if ((typeof entity[prop]) === "string") {
						query.push('"' + entity[prop] + '"');
					} else {
						if (entity[prop] === null || entity[prop] === undefined) {
							query.push("NULL");
						} else {
							if ((typeof entity[prop]) === "boolean") {
								query.push(Number(entity[prop] || 0));
							} else {
								query.push(entity[prop]);
							}
						}
					}
					if (index < keys.length - 1) {
						query.push(",");
					}
				});
				query.push(")");
				var sql = query.join("");
				this.execSQL(sql, []).then(function (result) {
					deferred.resolve(result);
				}, function (err) {
					console.log(err);
					deferred.reject(err);
				});
				return deferred.promise;
			}

			SqliteRepositoryFactory.prototype.update = function (entity, where) {
				var deferred = $q.defer();

				if (where === null || where === "" || where === undefined) {
					deferred.reject("Where not found");
				} else {
					var tableName = this.getTableName();
					var query = [];
					query.push("UPDATE ");
					query.push(tableName);
					query.push(" SET ");
					var keys = Object.keys(entity);
					keys.forEach(function (prop, index) {
						query.push(prop);
						query.push("=");
						if ((typeof entity[prop]) === "string") {
							query.push('"' + entity[prop] + '"');
						} else {
							if (entity[prop] === null || entity[prop] === undefined) {
								query.push("NULL");
							} else {
								if ((typeof entity[prop]) === "boolean") {
									query.push(Number(entity[prop] || 0));
								} else {
									query.push(entity[prop]);
								}
							}
						}
						if (index < keys.length - 1) {
							query.push(",");
						}
					});
					query.push(" WHERE ");
					query.push(where);

					var sql = query.join("");
					this.execSQL(sql, []).then(function (result) {
						deferred.resolve(result);
					}, function (err) {
						console.log(err);
						deferred.reject(err);
					});
				}

				return deferred.promise;
			}

			SqliteRepositoryFactory.prototype.select = function (fields, where) {
				var deferred = $q.defer();

				var tableName = this.getTableName();
				var query = [];
				query.push("SELECT ");

				fields.forEach(function (prop, index) {
					query.push(prop);
					if (index < fields.length - 1) {
						query.push(",");
					}
				});
				query.push(" FROM ");
				query.push(tableName);
				if (where.length > 0) {
					query.push(" WHERE ");
					query.push(where);
				}

				var sql = query.join("");
				this.execSQL(sql, []).then(function (result) {
					deferred.resolve(result);
				}, function (err) {
					console.log(err);
					deferred.reject(err);
				});

				return deferred.promise;
			}

			return SqliteRepositoryFactory;
		});




