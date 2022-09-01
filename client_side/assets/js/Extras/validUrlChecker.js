const isUrlValid = (string) =>
{
  try
  {
    new URL(string);
    return true;
  }
  catch (_)
  {
    return false;
  }
}