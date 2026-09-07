# RabbitMQ local

RabbitMQ 4.1.4 transporte `enrollment.created.v1`, `notification.requested.v1` et `account.deletion.requested.v1`. Les messages sont minimisés : identifiants synthétiques, type, version, date et identifiant de corrélation ; ni email, ni token, ni profil complet.
