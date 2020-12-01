from datetime import datetime
 

# dd/mm/YY H:M:S
now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print("date and time =", now)	